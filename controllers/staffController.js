import Staff from "../models/Staff.js";

// @desc    Create a new staff member
// @route   POST /api/staff/add
export const createStaff = async (req, res) => {
    try {
        const staff = new Staff(req.body);
        const savedStaff = await staff.save();
        res.status(201).json({ success: true, message: "Staff created", staff: savedStaff });
    } catch (error) {
        console.error("Create Staff Error:", error);
        res.status(500).json({ success: false, error: error.message || "Failed to create staff" });
    }
};

// @desc    Get all staff members
// @route   GET /api/staff
export const getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, staff });
    } catch (error) {
        console.error("Get All Staff Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch staff members" });
    }
};

// @desc    Get a single staff member by ID
// @route   GET /api/staff/:id
export const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ success: false, error: "Staff not found" });
        }
        res.status(200).json({ success: true, staff });
    } catch (error) {
        console.error("Get Staff By ID Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch staff member" });
    }
};

// @desc    Update a staff member
// @route   PUT /api/staff/:id
export const updateStaff = async (req, res) => {
    try {
        const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedStaff) {
            return res.status(404).json({ success: false, error: "Staff not found" });
        }
        res.status(200).json({ success: true, message: "Staff updated", staff: updatedStaff });
    } catch (error) {
        console.error("Update Staff Error:", error);
        res.status(500).json({ success: false, error: error.message || "Failed to update staff" });
    }
};

// @desc    Delete a staff member
// @route   DELETE /api/staff/:id
export const deleteStaff = async (req, res) => {
    try {
        const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
        if (!deletedStaff) {
            return res.status(404).json({ success: false, error: "Staff not found" });
        }
        res.status(200).json({ success: true, message: "Staff deleted", staff: deletedStaff });
    } catch (error) {
        console.error("Delete Staff Error:", error);
        res.status(500).json({ success: false, error: "Failed to delete staff member" });
    }
};
