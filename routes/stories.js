const express = require("express");
const { render } = require("node-sass");
const { ensureAuth } = require("../middleware/auth");
const router = express.Router();
const Story = require("../models/story");

// GET '/'
router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

// POST /
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

// Show stories

router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();

    res.render("stories/index", { stories });
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

// Show a story

router.get("/:id", ensureAuth,async (req, res) => {
  try {
    let story = await Story.findById({_id:req.params.id})
    .populate('user')
    .lean();

    if(!story)
      res.render('error/404');
    res.render('stories/show',{
      story
    })
  } catch (error) {
    console.log(error);
    res.render('error/500');
  }
  // res.render("stories/add");
});

// Show the edit page

router.get("/edit/:id", ensureAuth, async (req, res) => {
  const story = await Story.findOne({ _id: req.params.id }).lean();

  if (!story) {
    return res.render("error/404");
  }

  if (story.user != req.user.id) {
    return redirect("/stories");
  } else {
    return res.render("stories/edit", {
      story,
    });
  }
});

// Update a story
router.put("/:id", ensureAuth, async (req, res) => {
  let story = await Story.findById(req.params.id).lean();

  if (!story) {
    return res.render("error/404");
  }
  if (story.user != req.user.id) {
    return redirect("/stories");
  } else {
    try {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });

      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
      res.render("error/500");
    }
  }
});

// delete story

router.delete("/:id", ensureAuth, async (req, res) => {
  let story = await Story.findById(req.params.id).lean();

  if (!story) {
    return res.render("error/404");
  }
  if (story.user != req.user.id) {
    return redirect("/dashboard");
  } else {
    try {
      story = await Story.remove({ _id: req.params.id });
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
      res.render("error/500");
    }
  }
});
module.exports = router;
