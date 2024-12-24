import { createClient } from '@supabase/supabase-js'
import './style.css'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vjaolwcexcjblstbsyoj.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYW9sd2NleGNqYmxzdGJzeW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NDQ3OTAsImV4cCI6MjA1MDIyMDc5MH0.ITA8YP8f1Yj_MJuyqr6GjFYGmhpnM5x5LGpw4sfbDJw'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let isEditing = false;
let editingId = null;

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

async function signInWithEmail() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!session) {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: 'test@example.com',
                password: 'test123456'
            })
            if (signInError) {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: 'test@example.com',
                    password: 'test123456'
                })
                if (signUpError) throw signUpError
            }
        }
        return true
    } catch (error) {
        console.error('Authentication error:', error)
        return false
    }
}

const prefillData = {
    id: generateUUID(),
    from: 'New York',
    to: 'Paris',
    to_country: 'France',
    to_country_emoji: '🇫🇷',
    travel_dates_stops: 'Non-stop',
    discount_price: 499,
    original_price: 899,
    discount: 400,
    posted_by: 'System',
    posted_by_avatar: 'https://example.com/avatar.jpg',
    posted_by_description: 'Deal Hunter',
    cabin_type: 'Economy',
    departure_time: '08:00',
    arrival_time: '20:00',
    flight_duration: '12h 00m',
    url: 'https://example.com/paris-deal',
    image_url: 'https://example.com/paris.jpg',
    is_hot: true
}

function prefillForm(data = prefillData) {
    const form = document.getElementById('dealForm')
    if (!form) return

    const formData = { ...data }
    if (!isEditing) {
        formData.id = generateUUID()
    }

    Object.entries(formData).forEach(([key, value]) => {
        const input = form.elements[key]
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = value
            } else {
                input.value = value
            }
        }
    })

    const submitButton = form.querySelector('button[type="submit"]')
    if (submitButton) {
        submitButton.textContent = isEditing ? 'Update Deal' : 'Add Deal'
    }
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price)
}

async function displayDeals() {
    try {
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) throw error

        const dealsList = document.getElementById('dealsList')
        if (!dealsList) return

        dealsList.innerHTML = `
            <div class="deals-table-container">
                <table class="deals-table">
                    <thead>
                        <tr>
                            <th>To</th>
                            <th>Price</th>
                            <th>From</th>
                            <th>Cabin Type</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(deal => `
                            <tr>
                                <td>${deal.to} ${deal.to_country_emoji || ''}</td>
                                <td>
                                    <div class="price-info">
                                        <span class="current-price">${formatPrice(deal.discount_price)}</span>
                                        <span class="original-price">${formatPrice(deal.original_price)}</span>
                                    </div>
                                </td>
                                <td>${deal.from}</td>
                                <td>${deal.cabin_type}</td>
                                <td>${formatDate(deal.created_at)}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button onclick="editDeal('${deal.id}')" class="edit-btn">Edit</button>
                                        <button onclick="deleteDeal('${deal.id}')" class="delete-btn">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `
    } catch (error) {
        console.error('Error fetching deals:', error)
        alert('Error fetching deals: ' + error.message)
    }
}

async function editDeal(id) {
    try {
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error

        isEditing = true
        editingId = id
        prefillForm(data)
        document.getElementById('dealForm').scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
        console.error('Error editing deal:', error)
        alert('Error editing deal: ' + error.message)
    }
}

async function deleteDeal(id) {
    if (!confirm('Are you sure you want to delete this deal?')) return

    try {
        const { error } = await supabase
            .from('deals')
            .delete()
            .eq('id', id)

        if (error) throw error

        await displayDeals()
        alert('Deal deleted successfully!')
    } catch (error) {
        console.error('Error deleting deal:', error)
        alert('Error deleting deal: ' + error.message)
    }
}

async function initializeForm() {
    const form = document.getElementById('dealForm')
    if (!form) return

    await signInWithEmail()

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        form.classList.add('loading')

        try {
            const formData = new FormData(e.target)
            const data = {
                id: formData.get('id'),
                to: formData.get('to'),
                to_country: formData.get('to_country'),
                to_country_emoji: formData.get('to_country_emoji'),
                image_url: formData.get('image_url'),
                discount_price: parseInt(formData.get('discount_price')),
                original_price: parseInt(formData.get('original_price')),
                discount: parseInt(formData.get('discount')),
                from: formData.get('from'),
                travel_dates_stops: formData.get('travel_dates_stops'),
                is_hot: formData.get('is_hot') === 'on',
                cabin_type: formData.get('cabin_type'),
                departure_time: formData.get('departure_time'),
                arrival_time: formData.get('arrival_time'),
                flight_duration: formData.get('flight_duration'),
                url: formData.get('url'),
                posted_by: formData.get('posted_by'),
                posted_by_avatar: formData.get('posted_by_avatar'),
                posted_by_description: formData.get('posted_by_description')
            }

            let error;
            if (isEditing) {
                ({ error } = await supabase
                    .from('deals')
                    .update(data)
                    .eq('id', editingId))
            } else {
                ({ error } = await supabase
                    .from('deals')
                    .insert([data]))
            }

            if (error) throw error

            alert(isEditing ? 'Deal updated successfully!' : 'Deal added successfully!')
            isEditing = false
            editingId = null
            prefillForm()
            displayDeals()
        } catch (error) {
            console.error('Error submitting deal:', error)
            alert('Error submitting deal: ' + error.message)
        } finally {
            form.classList.remove('loading')
        }
    })
}

// Make functions available globally for onclick handlers
window.editDeal = editDeal;
window.deleteDeal = deleteDeal;

document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1>Travel Deals Manager</h1>
    
    <form id="dealForm" class="deal-form">
      <input type="hidden" id="id" name="id">
      
      <div class="form-grid">
        <div class="form-group">
          <label for="from">From:</label>
          <input type="text" id="from" name="from" required>
        </div>

        <div class="form-group">
          <label for="to">To:</label>
          <input type="text" id="to" name="to" required>
        </div>

        <div class="form-group">
          <label for="to_country">To (country):</label>
          <input type="text" id="to_country" name="to_country" required>
        </div>

        <div class="form-group">
          <label for="to_country_emoji">To (country emoji):</label>
          <input type="text" id="to_country_emoji" name="to_country_emoji" placeholder="e.g. 🇫🇷">
        </div>

        <div class="form-group">
          <label for="travel_dates_stops">Travel Dates • Stops:</label>
          <select id="travel_dates_stops" name="travel_dates_stops" required>
            <option value="Non-stop">Non-stop</option>
            <option value="1 Stop">1 Stop</option>
            <option value="2+ Stops">2+ Stops</option>
          </select>
        </div>

        <div class="form-group">
          <label for="discount_price">Discount price:</label>
          <input type="number" id="discount_price" name="discount_price" required>
        </div>

        <div class="form-group">
          <label for="original_price">Original price:</label>
          <input type="number" id="original_price" name="original_price" required>
        </div>

        <div class="form-group">
          <label for="discount">Discount:</label>
          <input type="number" id="discount" name="discount" required>
        </div>

        <div class="form-group">
          <label for="posted_by">Posted By:</label>
          <input type="text" id="posted_by" name="posted_by" required>
        </div>

        <div class="form-group">
          <label for="posted_by_avatar">Posted By Avatar:</label>
          <input type="url" id="posted_by_avatar" name="posted_by_avatar">
        </div>

        <div class="form-group">
          <label for="posted_by_description">Posted By Description:</label>
          <input type="text" id="posted_by_description" name="posted_by_description">
        </div>

        <div class="form-group">
          <label for="cabin_type">Cabin Type:</label>
          <select id="cabin_type" name="cabin_type" required>
            <option value="Economy">Economy</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Business">Business</option>
            <option value="First">First</option>
          </select>
        </div>

        <div class="form-group">
          <label for="departure_time">Departure Time:</label>
          <input type="time" id="departure_time" name="departure_time" required>
        </div>

        <div class="form-group">
          <label for="arrival_time">Arrival Time:</label>
          <input type="time" id="arrival_time" name="arrival_time" required>
        </div>

        <div class="form-group">
          <label for="flight_duration">Flight Duration:</label>
          <input type="text" id="flight_duration" name="flight_duration" placeholder="e.g. 2h 30m" required>
        </div>

        <div class="form-group">
          <label for="url">URL:</label>
          <input type="url" id="url" name="url" required>
        </div>

        <div class="form-group">
          <label for="image_url">Image URL:</label>
          <input type="url" id="image_url" name="image_url" required>
        </div>

        <div class="form-group checkbox-group">
          <label for="is_hot">Is HOT DEAL?</label>
          <input type="checkbox" id="is_hot" name="is_hot">
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-btn">Add Deal</button>
        <button type="button" class="reset-btn" onclick="prefillForm()">Reset</button>
      </div>
    </form>

    <div id="dealsList" class="deals-list"></div>
  </div>
`

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await initializeForm()
        prefillForm()
        displayDeals()
    })
} else {
    initializeForm()
    prefillForm()
    displayDeals()
}
