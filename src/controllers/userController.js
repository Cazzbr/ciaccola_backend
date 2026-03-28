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
    const { email, contacts } = req.body;
    
    if (email) {
      const existingEmail = await User.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updates = { ...req.body };
    if (email !== undefined) updates.email = email || null;  // Allow null

    // Handle contact acceptance: update sender's profile too
    if (contacts && Array.isArray(contacts)) {
      for (const contact of contacts) {
        if (contact.status === 'accepted') {
          const sender = await User.findOne({ username: contact.contact_username });
          if (sender) {
            const existingSenderContact = sender.contacts.find(
              c => c.contact_username === req.user.username
            );
            if (existingSenderContact && existingSenderContact.status === 'pending') {
              existingSenderContact.status = 'accepted';
              await sender.save();
            }
          }
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id, 
      updates, 
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    res.json({
      ...user._doc,
      emailRecovery: user.hasEmailRecovery()
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
      { 'contacts.contact_username': username },
      { $set: { 'contacts.$[elem].status': 'deleted' } },
      { arrayFilters: [{ 'elem.contact_username': username }] }
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
      c => c.contact_username === contact_username
    );
    if (existingContact) {
      return res.status(400).json({ error: 'Contact already added' });
    }

    req.user.contacts.push({
      contact_username,
      status: 'pending'
    });
    await req.user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getContacts = async (req, res) => {
  res.json(req.user.contacts);
};
