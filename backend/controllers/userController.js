import User from '../models/User.js';
import { deleteFile, getFileUrl } from '../middleware/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    console.log('📝 updateUserProfile: User ID:', req.user.id);
    console.log('📝 updateUserProfile: Received data:', {
      name: req.body.name,
      skills: req.body.skills,
      experience: req.body.experience,
      languages: req.body.languages,
      hasAvatar: !!req.files?.avatar,
      hasResume: !!req.files?.resume
    });
    
    // Get existing user to check for old files
    const existingUser = await User.findById(req.user.id);
    
    // Parse JSON strings from FormData
    const parseJSON = (field) => {
      if (!field) return undefined;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (e) {
          return field;
        }
      }
      return field;
    };
    
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      location: req.body.location,
      bio: req.body.bio,
      publicProfile: req.body.publicProfile === 'true' || req.body.publicProfile === true,
      // Job preferences
      preferredLocations: req.body.preferredLocations,
      jobTypes: parseJSON(req.body.jobTypes),
      industries: parseJSON(req.body.industries),
      desiredRoles: req.body.desiredRoles,
      salaryMin: req.body.salaryMin,
      salaryMax: req.body.salaryMax,
      availabilityDate: req.body.availabilityDate,
      willingToRelocate: req.body.willingToRelocate === 'true' || req.body.willingToRelocate === true,
      // Skills, experience, education
      skills: parseJSON(req.body.skills),
      experience: parseJSON(req.body.experience),
      education: parseJSON(req.body.education),
      languages: parseJSON(req.body.languages),
      portfolioLinks: parseJSON(req.body.portfolioLinks),
      resume: parseJSON(req.body.resume)
    };

    // Handle avatar upload
    if (req.files && req.files.avatar) {
      const avatarFile = req.files.avatar[0];
      console.log('📸 updateUserProfile: Avatar uploaded:', avatarFile.filename);
      
      // Delete old avatar if exists
      if (existingUser.avatar) {
        const oldAvatarPath = path.join(__dirname, '../uploads/avatars', path.basename(existingUser.avatar));
        deleteFile(oldAvatarPath);
      }
      
      fieldsToUpdate.avatar = getFileUrl(avatarFile.filename, 'avatar');
    }

    // Handle resume upload
    if (req.files && req.files.resume) {
      const resumeFile = req.files.resume[0];
      console.log('📄 updateUserProfile: Resume uploaded:', resumeFile.filename);
      
      // Delete old resume if exists
      if (existingUser.resume && existingUser.resume.url) {
        const oldResumePath = path.join(__dirname, '../uploads/resumes', path.basename(existingUser.resume.url));
        deleteFile(oldResumePath);
      }
      
      fieldsToUpdate.resume = {
        url: getFileUrl(resumeFile.filename, 'resume'),
        uploadedAt: new Date()
      };
    }

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    console.log('💾 updateUserProfile: Saving to database:', fieldsToUpdate);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    console.log('✅ updateUserProfile: User updated successfully:', {
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      resumeUrl: user.resume?.url,
      skills: user.skills,
      experience: user.experience
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('❌ updateUserProfile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
