import { Router } from "express";
import * as authController from "./authController.js";
import { 
   signUpValidator, 
   loginValidator, 
   forgotPasswordValidator,
   resetPasswordValidator,
   tokenValidator,
   updateProfileValidator,
   updatePasswordValidator
} from "./authValidations.js";
import { validation } from "../../middlewares/validation.js";
import { protect } from "../../middlewares/auth.js";
import { uploaders, handleMulterError, uploadToCloudinary } from "../../utils/multer.js";

const router = Router();

// Signup route
router.post('/signup', 
   validation({ body: signUpValidator }), 
   authController.signUp
);

// Email confirmation route
router.get('/confirm-email/:token', 
   validation({ params: tokenValidator }), 
   authController.confirmEmail
);

// Login route
router.post('/login', 
   validation({ body: loginValidator }), 
   authController.login
);

// Logout route
router.post('/logout', 
   authController.logout
);

// Refresh token route
router.post('/refresh-token', 
   authController.refreshToken
);

// Get profile route (protected)
router.get('/profile', 
   protect, 
   authController.getProfile
);

// Upload profile image route (protected)
router.post('/upload-profile-image', 
   protect,
   uploaders.profileImage.single('image'),
   handleMulterError,
   uploadToCloudinary('profiles'),
   authController.uploadProfileImage
);

// Update profile route (protected)
router.put('/update-profile', 
   protect,
   validation({ body: updateProfileValidator }),
   authController.updateProfile
);

// Update password route (protected)
router.put('/update-password', 
   protect,
   validation({ body: updatePasswordValidator }),
   authController.updatePassword
);

// Forgot password route
router.post('/forgot-password', 
   validation({ body: forgotPasswordValidator }), 
   authController.forgotPassword
);

// Reset password route
router.post('/reset-password', 
   validation({ body: resetPasswordValidator }), 
   authController.resetPassword
);

// Admin routes (protected, admin only)
router.get('/getAllUsers', 
   protect, 
   authController.getAllUsers
);

router.patch('/updateUserStatus/:id', 
   protect, 
   authController.updateUserStatus
);

router.patch('/updateUserRole/:id', 
   protect, 
   authController.updateUserRole
);

router.delete('/deleteUser/:id', 
   protect, 
   authController.deleteUser
);

export default router; 