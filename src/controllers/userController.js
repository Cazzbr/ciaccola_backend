import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      ...user._doc,
      emailRecovery: user.hasEmailRecovery()
    });
  } catch (err) {
    res.status(500).json({ error: 'Profile fetch failed' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (email) {
      const existingEmail = await User.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    if (password !== undefined && password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const validRoles = ['standard', 'premium'];
    if (role !== undefined && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email !== undefined) {
      user.email = email || null;
    }
    if (password !== undefined) {
      user.password = password;
    }
    if (role !== undefined) {
      user.role = role;
    }

    const updates = { ...req.body };
    delete updates.email;
    delete updates.contacts;
    delete updates.password;
    delete updates.role;
    user.set(updates);

    await user.save();
    const updatedUser = await User.findById(req.user._id).select('-password');

    res.json({
      ...updatedUser._doc,
      emailRecovery: updatedUser.hasEmailRecovery()
    });
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const username = req.user.username;

    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await User.updateMany(
      { 'contacts.contact_id': req.user._id },
      { $set: { 'contacts.$[elem].status': 'deleted' } },
      { arrayFilters: [{ 'elem.contact_id': req.user._id }] }
    );

    res.json({ success: true, message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Profile delete failed' });
  }
};

export const addContact = async (req, res) => {
  try {
    const { contact_username } = req.body;
    const contact = await User.findOne({ username: contact_username });
    if (!contact) return res.status(404).json({ error: 'User not found' });

    const existingContact = req.user.contacts.find(
      c => c.contact_id.toString() === contact._id.toString()
    );
    if (existingContact) {
      return res.status(400).json({ error: 'Contact already added' });
    }

    req.user.contacts.push({
      contact_id: contact._id,
      status: 'pending'
    });
    await req.user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const acceptContactInvite = async (req, res) => {
  try {
    const { contact_username } = req.body;
    if (!contact_username) {
      return res.status(400).json({ error: 'contact_username is required' });
    }

    const sender = await User.findOne({ username: contact_username });
    if (!sender) {
      return res.status(404).json({ error: 'Contact sender not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingSenderContact = sender.contacts.find(
      c => c.contact_id.toString() === user._id.toString() && c.status === 'pending'
    );
    if (!existingSenderContact) {
      return res.status(400).json({ error: 'No pending invite found for sender' });
    }

    existingSenderContact.status = 'accepted';
    user.contacts.push({
      contact_id: sender._id,
      status: 'accepted'
    });

    await sender.save();
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const contact = user.contacts.id(id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    if (contact.status === 'accepted') {
      contact.status = 'blocked';
    } else if (contact.status === 'blocked') {
      contact.status = 'accepted';
    } else {
      return res.status(400).json({ error: 'Status can only be toggled for accepted or blocked contacts' });
    }

    await user.save();
    res.json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { term } = req.params;
    const { limit } = req.query;
    if (!term || typeof term !== 'string') {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const regex = new RegExp(term, 'i');
    const query = {
      $or: [
        { username: regex },
        { email: regex }
      ]
    };

    let usersQuery = User.find(query).select('username role last_seen createdAt');
    if (limit !== undefined) {
      const parsedLimit = parseInt(limit, 10);
      if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
        return res.status(400).json({ error: 'Limit must be a positive integer' });
      }
      usersQuery = usersQuery.limit(parsedLimit);
    }

    const users = await usersQuery;
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'User search failed' });
  }
};
