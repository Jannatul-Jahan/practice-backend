const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const ProductModel = require("../model/Product");
const UserModel = require("../model/User");
const HTTP_STATUS = require("../constants/statusCodes");

class ProductController {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const sortField = req.query.sortField || 'price';
      const sortOrder = req.query.sortOrder || 'asc';
      const skip = (page - 1) * limit;
  
      if (page < 1 || limit < 1) {
        return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid page or limit value. Both must be greater than or equal to 1."));
      }
  
      if (sortOrder !== 'asc' && sortOrder !== 'desc') {
        return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid query: Please use 'asc' or 'desc' for sorting order"));
      }
  
      const minPrice = req.query.minPrice !== undefined ? parseFloat(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice !== undefined ? parseFloat(req.query.maxPrice) : undefined;
      const minStock = req.query.minStock !== undefined ? parseInt(req.query.minStock) : undefined;
      const maxStock = req.query.maxStock !== undefined ? parseInt(req.query.maxStock) : undefined;
      const minRating = req.query.minRating !== undefined ? parseFloat(req.query.minRating) : undefined;
      const maxRating = req.query.maxRating !== undefined ? parseFloat(req.query.maxRating) : undefined;
  
      if (
        (req.query.minPrice !== undefined && isNaN(minPrice)) ||
        (req.query.maxPrice !== undefined && isNaN(maxPrice)) ||
        (req.query.minStock !== undefined && isNaN(minStock)) ||
        (req.query.maxStock !== undefined && isNaN(maxStock)) ||
        (req.query.minRating !== undefined && isNaN(minRating)) ||
        (req.query.maxRating !== undefined && isNaN(maxRating))
      ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid query: minPrice, maxPrice, minStock, maxStock, minRating, and maxRating must be numeric values."));
      }
  
      const allProducts = await ProductModel.find({}, { title: 1, description: 1, price: 1, stock: 1, rating: 1 });
  
      if (allProducts.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).send(success("No products were found"));
      }
  
      const searchText = req.query.searchText || '';
  
      const filteredProducts = allProducts.filter(product => {
        const productPrice = parseFloat(product.price);
        const productStock = parseInt(product.stock);
        const productRating = parseFloat(product.rating);

        const PriceFilter = (minPrice ? productPrice >= minPrice : true) &&
          (maxPrice ? productPrice <= maxPrice : true);
        const StockFilter = (minStock ? productStock >= minStock : true) &&
          (maxStock ? productStock <= maxStock : true);
        const RatingFilter = (minRating ? productRating >= minRating : true) &&
          (maxRating ? productRating <= maxRating : true);
  
        const searchRegex = new RegExp(searchText, 'i');
        const titleMatch = searchRegex.test(product.title);
        const descriptionMatch = searchRegex.test(product.description);
  
        return PriceFilter && StockFilter && RatingFilter && (titleMatch || descriptionMatch);
      });
  
      const sortedProducts = filteredProducts.sort((a, b) => {
        const aValue = parseFloat(a[sortField]);
        const bValue = parseFloat(b[sortField]);
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
  
      const total = sortedProducts.length;
  
      const finalData = sortedProducts.slice(skip, skip + limit);
      const responseData = {
        total,
        countPerPage: finalData.length,
        page,
        limit,
        data: finalData,
      };
  
      return res.status(HTTP_STATUS.OK).send(success("Successfully received all products", responseData));
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
    }
  }
  
  // async getAll(req, res) {
  //   try {
  //     const page = parseInt(req.query.page) || 1;
  //     const limit = parseInt(req.query.limit) || 50;
  //     const sortField = req.query.sortField || 'price'; 
  //     const sortOrder = req.query.sortOrder || 'asc'; 
  //     const skip = (page - 1) * limit;

  //     if (page < 1 || limit < 1) {
  //       return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid page or limit value. Both must be greater than or equal to 1."));
  //     }

  //     if (sortOrder !== 'asc' && sortOrder !== 'desc') {
  //       return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid query: Please use 'asc' or 'desc' for sorting order"));
  //     }
      
  //     const allProducts = await ProductModel.find({},{title: 1, description:1, price: 1, stock: 1, rating: 1});
  //       // .skip(skip)
  //       // .limit(limit);
        
  //     if (allProducts.length === 0) {
  //       return res.status(HTTP_STATUS.NOT_FOUND).send(success("No products were found"));
  //     }

  //     const minPrice = parseFloat(req.query.minPrice);
  //     const maxPrice = parseFloat(req.query.maxPrice);
  //     const minStock = parseInt(req.query.minStock);
  //     const maxStock = parseInt(req.query.maxStock);
  //     const minRating = parseFloat(req.query.minRating);
  //     const maxRating = parseFloat(req.query.maxRating);
  //     const searchText = req.query.searchText || '';

  //     const filteredProducts = allProducts.filter(product => {
  //       const productPrice = parseFloat(product.price);
  //       const productStock = parseInt(product.stock);
  //       const productRating = parseFloat(product.rating);
  //       const PriceFilter = (!isNaN(minPrice) ? productPrice >= minPrice : true) &&
  //              (!isNaN(maxPrice) ? productPrice <= maxPrice : true);
  //       const StockFilter = (!isNaN(minStock) ? productStock >= minStock : true) &&
  //              (!isNaN(maxStock) ? productStock <= maxStock : true);
  //       const RatingFilter = (!isNaN(minRating) ? productRating >= minRating : true) &&
  //              (!isNaN(maxRating) ? productRating <= maxRating : true);
        
  //       const searchRegex = new RegExp(searchText, 'i'); 
  //       const titleMatch = searchRegex.test(product.title);
  //       const descriptionMatch = searchRegex.test(product.description);

  //       return PriceFilter && StockFilter && RatingFilter && (titleMatch || descriptionMatch);
  //     });

      
  //     const sortedProducts = filteredProducts.sort((a, b) => {
  //       const aValue = parseFloat(a[sortField]);
  //       const bValue = parseFloat(b[sortField]);
  //       return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  //     });

  //     const total = sortedProducts.length;

  //     const finalData = sortedProducts.slice(skip, skip + limit);
  //     const responseData = {
  //       total,
  //       countPerPage: finalData.length,
  //       page,
  //       limit,
  //       data: finalData,
  //     };

  //     return res.status(HTTP_STATUS.OK).send(success("Successfully received all products", responseData));
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
  //   }
  // }

  // async getAll(req, res) {
  //   try {
  //     const page = parseInt(req.query.page) || 1;
  //     const limit = parseInt(req.query.limit) || 50; 
  //     const sortField = req.query.sortField || 'price'; // Default sorting field is 'price'
  //     const sortOrder = req.query.sortOrder || 'asc'; // Default sorting order is ascending
  //     const skip = (page - 1) * limit;

  //     const query = {}; 
  //     const sortOptions = {};
  //     sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

  //     const allProducts = await ProductModel.find(query, { title: 1, price: 1, stock:1, rating:1})
  //       .skip(skip)
  //       .limit(limit)
  //       .sort(sortOptions); // Apply sorting based on user input;

  //       if (allProducts.length === 0) {
  //         return res
  //           .status(HTTP_STATUS.NOT_FOUND)
  //           .send(success("No products were found"));
  //       }

  //     const total = await ProductModel.countDocuments(query);

  //     const responseData = {
  //       total,
  //       countPerPage: allProducts.length,
  //       page,
  //       limit,
  //       data: allProducts,
  //     };
  //       return res.status(HTTP_STATUS.OK).send(success("Successfully received all products", responseData));
  //     } catch (error) {
  //       console.log(error);
  //       return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
  //     }
  // }

  async create(req, res){
    try {
        const validationErrors = validationResult(req).array();
        if (validationErrors.length > 0) {
          return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Validation failed", validationErrors));
        }
    
        const { title, description, price } = req.body;
        const Product = await ProductModel.create({ title, description, price });
    
        if (Product) {
            return res.status(HTTP_STATUS.CREATED).send(success("Product created successfully", Product));
          } else {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Failed to create"));
          }
      } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
      }

  }
  
  async addReview(req, res) {
    try {
      const { user, rating, comment } = req.body; 
      const productId = req.params.productId; 
      const product = await ProductModel.findById(productId);
  
      if (!product) {
        return res.status(HTTP_STATUS.NOT_FOUND).send(failure('Product not found'));
      }
  
      const newReview = {
        user: user, 
        rating,
        comment,
      };
  
      product.reviews.push(newReview);
      await product.save();
  
      return res.status(HTTP_STATUS.CREATED).send(success('Review added successfully'));
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure('Internal server error'));
    }
  }
  
  async getAllReviews(req, res) {
    try {
      const productId = req.params.productId;
  
      const product = await ProductModel.findById(productId)
        .populate("reviews.user");  
  
      if (!product) {
        return res.status(HTTP_STATUS.NOT_FOUND).send(failure('Product not found'));
      }
  
      const reviews = product.reviews;
  
      return res.status(HTTP_STATUS.OK).send(success('Reviews retrieved successfully', reviews));
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure('Internal server error'));
    }
  }
  
}

module.exports = new ProductController();