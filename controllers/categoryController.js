import Category from "../models/Category.js";
import Product from "../models/Product.js";

// Route to add a new employee
const addCategory = async (req, res) => {
  try {
    const { formCategory, formDescription } = req.body;

    // Check if user already exists with the same email
    let existingCategory = await Category.findOne({ name: formCategory });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, error: "Category already exists" });
    }

    // Hash the password before storing the user
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newCategory = new Category({
      name: formCategory,
      description: formDescription,
    });
    const category = await newCategory.save();

    res
      .status(201)
      .json({ success: true, message: "Category created successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const getCategorys = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(201).json({ success: true, categories });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Server error " + error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { formCategory, formDescription } = req.body;

    const category = await Category.findById({ _id: id });
    if (!category) {
      res.status(404).json({ success: false, error: "Category Not Found" });
    }

    const updateCategory = await Category.findByIdAndUpdate(
      { _id: id },
      { name: formCategory, description: formDescription }
    );

    res.status(201).json({ success: true, updateCategory });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Server error " + error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Log category ID for debugging
    console.log("Attempting to delete category:", id);

    // Check for any products linked to this category
    const associatedProducts = await Product.find({ category: id });
    console.log("Found products:", associatedProducts.map(p => p.name)); // debug log

    if (associatedProducts.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete category with associated products",
        products: associatedProducts, // helpful for debugging
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deleted", category: deletedCategory });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, error: "Server error: " + error.message });
  }
};


export { addCategory, getCategorys, updateCategory, deleteCategory };
