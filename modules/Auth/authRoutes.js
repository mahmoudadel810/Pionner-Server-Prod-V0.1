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

router.post('/signup', 
   validation({ body: signUpValidator }), 
   authController.signUp
);

router.get('/confirm-email/:token', 
   validation({ params: tokenValidator }), 
   authController.confirmEmail
);

router.post('/login', 
   validation({ body: loginValidator }), 
   authController.login
);

router.post('/logout', 
   authController.logout
);

router.post('/refresh-token', 
   authController.refreshToken
);

router.get('/profile', 
   protect, 
   authController.getProfile
);

router.post('/upload-profile-image', 
   protect,
   uploaders.profileImage.single('image'),
   handleMulterError,
   uploadToCloudinary('profiles'),
   authController.uploadProfileImage
);

router.put('/update-profile', 
   protect,
   validation({ body: updateProfileValidator }),
   authController.updateProfile
);

router.put('/update-password', 
   protect,
   validation({ body: updatePasswordValidator }),
   authController.updatePassword
);

router.post('/forgot-password', 
   validation({ body: forgotPasswordValidator }), 
   authController.forgotPassword
);

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