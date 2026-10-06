import { Router } from "express";
import * as contactUsController from "./contactUsController.js";
import { 
   contactValidator,
   contactIdValidator
} from "./contactUsValidations.js";
import { validation } from "../../middlewares/validation.js";
import { protect, adminRoute } from "../../middlewares/auth.js";

const router = Router();

router.post('/submitContactForm', 
   validation({ body: contactValidator }), 
   contactUsController.createContact
);

router.get('/getAllContactSubmissions', 
   protect,
   adminRoute,
   contactUsController.getAllContact
);

router.get('/getContactSubmission/:id', 
   protect,
   adminRoute,
   validation({ params: contactIdValidator }), 
   contactUsController.getContact
);

router.delete('/deleteContactSubmission/:id', 
   protect,
   adminRoute,
   validation({ params: contactIdValidator }), 
   contactUsController.deleteContact
);

router.patch('/markAsRead/:id', 
   protect,
   adminRoute,
   validation({ params: contactIdValidator }), 
   contactUsController.markAsRead
);

router.get('/getUnreadCount', 
   protect,
   adminRoute,
   contactUsController.getUnreadCount
);

export default router; 