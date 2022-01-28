const { User, Thought } = require('../models');

const thoughtController = {
    getAllThoughts(req, res) {
        Thought.find({})
            .select('-__v')
            .then(data => res.json(data))
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },
    createThought({ body }, res) {
        Thought.create(body)
            .then(({ _id }) => {
                _id = _id.toString().split('"')[0];
                return User.findOneAndUpdate(
                    { _id: body.userId },
                    { $push: { thoughts: _id } },
                    { new: true }
                );
            })
            .then(data => {
                console.error(data)
                if (!data) {
                    res.status(404).json({ message: 'No thought found with this id!' });
                    return;
                }
                res.json(data);
            })
            .catch(err => res.json(err));
    },
    getThoughtById({ params }, res) {
        Thought.findOne({ _id: params.id })
            .select('-__v')
            .then(data => {
                if (!data) {
                    res.status(404).json({ message: 'No thought found with this id!' });
                    return;
                }
                res.json(data);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },
    updateThought({ params, body }, res) {
        Thought.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
            .then(data => {
                if (!data) {
                    res.status(404).json({ message: 'No thought found with this id!' });
                    return;
                }
                res.json(data);
            })
            .catch(err => res.status(400).json(err));
    },
    deleteThought({ params, body }, res) {
        Thought.findOneAndDelete({ _id: params.id })
            .then(deletedThought => {
                if (!deletedThought) {
                    return res.status(404).json({ message: 'No thought with this id!' });
                }
                console.log(body)
                return User.findOneAndUpdate(
                    { thoughts: params.id },
                    { $pull: { thoughts: params.id } },
                    { new: true }
                );
            })
            .then(data => {
                if (!data) {
                    res.status(404).json({ message: 'No thought found with this id!' });
                    return;
                }
                res.json(data);
            })
            .catch(err => res.json(err));
    },
    createReaction({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $push: { reactions: body } },
            { new: true }
        )
            .select('-__v')
            .then(data => {
                if (!data) {
                    res.status(404).json({ message: 'No thought found with this id!' });
                    return;
                }
                res.json(data);
            })
            .catch(err => res.json(err));
    },
    deleteReaction ({ params }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: { _id: params.reactionId } } },
            { new: true }
        )
            .then(dbPizzaData => res.json(dbPizzaData))
            .catch(err => res.json(err));
    }
}

module.exports = thoughtController;

