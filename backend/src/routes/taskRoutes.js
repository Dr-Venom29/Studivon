const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const coachController = require('../controllers/coachController');

// This route handles creating a task with the "Priority Logic"
router.post('/add', taskController.createSmartTask);
router.put('/missed/:taskId', taskController.handleMissedTask);
router.put('/complete/:taskId', taskController.completeTask);
router.get('/mastery', taskController.getSubjectMastery);
router.get('/predict/:subject', taskController.getPredictiveInsights);
router.get('/strategy', taskController.getUserStrategy);
router.post('/coach-advice', coachController.getCoachAdvice);
router.get('/trends', taskController.getTrendAnalysis);
//router.post('/set-goal', taskController.setUserGoal);
//router.get('/prioritized-list', taskController.getTasks);
router.post('/strategy-coach', coachController.getStrategyCoachAdvice);
router.get('/weekly-report', taskController.getWeeklyReport);
router.get('/dossier', taskController.getStudentDossier);

module.exports = router;