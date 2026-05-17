const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')
require('dotenv').config()

const app  = express()
const PORT = process.env.PORT || 5000

/* ── Middleware ─────────────────────────────────────────── */
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}))
app.use(express.json())

/* ── MongoDB ────────────────────────────────────────────── */
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow'

mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`✅ MongoDB connected`))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1) })

/* ── Schema ─────────────────────────────────────────────── */
const todoSchema = new mongoose.Schema({
  text:     { type: String, required: true, trim: true, maxlength: 500 },
  done:     { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  tag:      { type: String, enum: ['work','personal','study','health','other'], default: 'work' },
}, { timestamps: true })

const Todo = mongoose.model('Todo', todoSchema)

/* ── Routes ─────────────────────────────────────────────── */

// GET all todos
app.get('/api/todos', async (req, res) => {
  try {
    res.json(await Todo.find().sort({ createdAt: -1 }))
  } catch {
    res.status(500).json({ error: 'Failed to fetch todos' })
  }
})

// POST create todo
app.post('/api/todos', async (req, res) => {
  try {
    const { text, priority, tag } = req.body
    if (!text?.trim()) return res.status(400).json({ error: 'Text required' })
    res.status(201).json(await Todo.create({ text: text.trim(), priority, tag }))
  } catch {
    res.status(500).json({ error: 'Failed to create todo' })
  }
})

// PATCH update todo
app.patch('/api/todos/:id', async (req, res) => {
  try {
    const updates = {}
    const { done, text, priority, tag } = req.body
    if (done     !== undefined) updates.done     = done
    if (text     !== undefined) updates.text     = text.trim()
    if (priority !== undefined) updates.priority = priority
    if (tag      !== undefined) updates.tag      = tag

    const todo = await Todo.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!todo) return res.status(404).json({ error: 'Not found' })
    res.json(todo)
  } catch {
    res.status(500).json({ error: 'Failed to update' })
  }
})

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id)
    if (!todo) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted', id: req.params.id })
  } catch {
    res.status(500).json({ error: 'Failed to delete' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()) + 's',
  })
})

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Backend on port ${PORT}`))
