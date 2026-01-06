import Department from '../models/Department.js';
import User from '../models/User.js';
import Job from '../models/Job.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public (basic info) / Private (full details for staff)
export const getDepartments = async (req, res) => {
  try {
    const { includeInactive = 'false' } = req.query;
    
    const query = {};
    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    const departments = await Department.find(query)
      .populate('head', 'name email jobTitle')
      .populate('parentDepartment', 'name code')
      .sort({ name: 1 });

    // For public access, return limited info
    if (!req.user || req.user.role === 'candidate') {
      const publicDepts = departments.map(d => ({
        _id: d._id,
        name: d.name,
        code: d.code,
        description: d.description
      }));
      
      return res.status(200).json({
        success: true,
        count: publicDepts.length,
        data: publicDepts
      });
    }

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Public
export const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'name email jobTitle avatar')
      .populate('parentDepartment', 'name code')
      .populate('recruitingContact', 'name email');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Get open positions count
    const openPositions = await Job.countDocuments({
      department: department._id,
      status: 'open',
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        openPositions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (HR/Admin)
export const createDepartment = async (req, res) => {
  try {
    const { name, code, description, head, parentDepartment, location, color } = req.body;

    // Check if code already exists
    const existingDept = await Department.findOne({ code: code.toUpperCase() });
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department code already exists'
      });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      head,
      parentDepartment,
      location,
      color
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (HR/Admin)
export const updateDepartment = async (req, res) => {
  try {
    const { name, description, head, parentDepartment, location, color, isActive, hiringSettings } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Update fields
    if (name) department.name = name;
    if (description !== undefined) department.description = description;
    if (head !== undefined) department.head = head;
    if (parentDepartment !== undefined) department.parentDepartment = parentDepartment;
    if (location) department.location = location;
    if (color) department.color = color;
    if (isActive !== undefined) department.isActive = isActive;
    if (hiringSettings) department.hiringSettings = { ...department.hiringSettings, ...hiringSettings };

    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has active jobs
    const activeJobs = await Job.countDocuments({
      department: department._id,
      status: { $in: ['open', 'pending_approval'] }
    });

    if (activeJobs > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${activeJobs} active job(s). Please close or move jobs first.`
      });
    }

    // Check for sub-departments
    const subDepts = await Department.countDocuments({ parentDepartment: department._id });
    if (subDepts > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${subDepts} sub-department(s). Please delete or reassign them first.`
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get department jobs
// @route   GET /api/departments/:id/jobs
// @access  Public
export const getDepartmentJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'open' } = req.query;

    const query = {
      department: req.params.id,
      isActive: true
    };

    // For public, only show open jobs
    if (!req.user || req.user.role === 'candidate') {
      query.status = 'open';
      query.internalOnly = false;
    } else if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .populate('hiringManager', 'name')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get department team members
// @route   GET /api/departments/:id/team
// @access  Private (Staff only)
export const getDepartmentTeam = async (req, res) => {
  try {
    const team = await User.find({
      department: req.params.id,
      role: { $ne: 'candidate' }
    })
      .select('name email jobTitle role avatar')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: team.length,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get department statistics
// @route   GET /api/departments/:id/stats
// @access  Private (HR/Hiring Manager)
export const getDepartmentStats = async (req, res) => {
  try {
    const departmentId = req.params.id;

    // Get job stats
    const jobStats = await Job.aggregate([
      { $match: { department: departmentId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get application stats
    const applicationStats = await Application.aggregate([
      { $match: { department: departmentId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get team size
    const teamSize = await User.countDocuments({
      department: departmentId,
      role: { $ne: 'candidate' }
    });

    res.status(200).json({
      success: true,
      data: {
        jobStats: Object.fromEntries(jobStats.map(s => [s._id, s.count])),
        applicationStats: Object.fromEntries(applicationStats.map(s => [s._id, s.count])),
        teamSize
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Import Application model for stats
import Application from '../models/Application.js';
