const express = require("express");
const router = express.Router();
const Result = require("../models/Result");
const mongoose = require("mongoose");

// SAVE SCORE (FINAL FIX)

// SAVE SCORE (ULTIMATE WORKING RESOLUTION)
// SAVE SCORE (BYPASS INDEX LOCK)
router.post("/save-score", async (req, res) => {
  try {
    const { userEmail, jobId, score, total } = req.body;

    // 1. Strict Payload Validation
    if (!userEmail || !jobId) {
      return res.status(400).json({ 
        success: false, 
        msg: "Missing payload data: userEmail and jobId are required." 
      });
    }

    const cleanEmail = userEmail.trim().toLowerCase();

    // 2. CRITICAL FIX: Pehle check karein ke is specific user ne is specific job ka test pehle diya hai ya nahi
    // Isse duplicate primary constraints bypass ho jayengi aur naye log smoothly save honge
    let existingResult = await Result.findOne({ 
      userEmail: cleanEmail, 
      jobId: jobId 
    }).hint({ _id: 1 }); // Force bypass corrupt index layers

    if (existingResult) {
      // Agar is user ne pehle test diya tha, to naya score update karein
      existingResult.score = score;
      existingResult.total = total || 10;
      existingResult.completedAt = new Date();
      
      await existingResult.save();
      return res.status(200).json({ 
        success: true, 
        msg: "Previous score updated successfully! 🔄", 
        data: existingResult 
      });
    }

    // 3. Agar naya user hai (dusra gmail account), to completely fresh entry create karein
    const newResult = new Result({
      userEmail: cleanEmail,
      jobId: jobId,
      score: Number(score),
      total: Number(total) || 10,
      completedAt: new Date()
    });

    await newResult.save();
    
    return res.status(200).json({ 
      success: true, 
      msg: "Test score submitted successfully for new candidate! ✅", 
      data: newResult 
    });

  } catch (error) {
    console.error("❌ CRITICAL DISPATCH STORAGE FAILURE:", error);
    
    // Agar MongoDB unique key unique validation error (Code 11000) de, to crash hone ki bajaye handle karein
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        msg: "Database duplicate index overlap. Clean index pipeline from mongo console." 
      });
    }

    res.status(500).json({ 
      success: false, 
      msg: "Internal server error saving test performance data metrics." 
    });
  }
});

// HISTORY
router.get("/:userEmail", async (req, res) => {
  try {
    const data = await Result.find({
      userEmail: req.params.userEmail,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;