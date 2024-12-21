import { createClient } from '@supabase/supabase-js'
import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vjaolwcexcjblstbsyoj.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYW9sd2NleGNqYmxzdGJzeW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NDQ3OTAsImV4cCI6MjA1MDIyMDc5MH0.ITA8YP8f1Yj_MJuyqr6GjFYGmhpnM5x5LGpw4sfbDJw'

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Function to generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

// Prefill form data
const prefillData = {
    id: generateUUID(),
    destination: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    image_url: 'https://example.com/image65.jpg',
    price: 199,
    original_price: 751,
    discount: 104,
    departure: 'New York',
    stops: 'Non-stop',
    is_hot: true,
    type: 'Economy',
    likes: 735,
    url: 'https://example.com/deal35',
    departure_time: '08:00',
    arrival_time: '12:00',
    flight_duration: '5h 30m',
    posted_by: 'Admin',
    posted_by_avatar: 'https://example.com/avatar21.jpg',
    posted_by_description: 'Luxury seeker'
}

// Function to prefill the form
function prefillForm() {
    console.log('Prefilling form...')
    const form = document.getElementById('dealForm')
    if (!form) {
        console.error('Form not found!')
        return
    }

    const newUUID = generateUUID()
    console.log('Generated UUID:', newUUID)

    Object.entries({ ...prefillData, id: newUUID }).forEach(([key, value]) => {
        const input = form.elements[key]
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = value
            } else if (input.type === 'select-one') {
                const option = Array.from(input.options).find(opt => opt.value === value)
                if (option) {
                    option.selected = true
                }
            } else {
                input.value = value
            }
            console.log(`Set ${key} to ${value}`)
        } else {
            console.warn(`Input for ${key} not found`)
        }
    })
    console.log('Form prefilled successfully')
}

// Function to display deals
async function displayDeals() {
    try {
        console.log('Fetching deals...')
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5)

        if (error) throw error

        console.log('Deals fetched:', data)

        const dealsList = document.getElementById('dealsList')
        if (!dealsList) {
            console.error('Deals list element not found!')
            return
        }

        dealsList.innerHTML = ''
        
        if (!data || data.length === 0) {
            dealsList.innerHTML = '<p>No deals found</p>'
            return
        }
        
        data.forEach(deal => {
            const div = document.createElement('div')
            div.className = 'deal-item'
            div.innerHTML = `
                <div>
                    <strong>${deal.destination}, ${deal.country}</strong> ${deal.flag}<br>
                    Stops: ${deal.stops}<br>
                    Type: ${deal.type}
                </div>
                <div>
                    <strong>Price:</strong> $${deal.price} (Save $${deal.discount})<br>
                    <strong>Departure:</strong> ${deal.departure}<br>
                    <strong>Duration:</strong> ${deal.flight_duration}
                </div>
                <div>
                    <strong>Posted by:</strong> ${deal.posted_by}<br>
                    <strong>Likes:</strong> ${deal.likes}<br>
                    <a href="${deal.url}" target="_blank">View Deal</a>
                </div>
            `
            dealsList.appendChild(div)
        })
        console.log('Deals displayed successfully')
    } catch (error) {
        console.error('Error in displayDeals:', error)
    }
}

// Function to initialize form
function initializeForm() {
    console.log('Initializing form...')
    const form = document.getElementById('dealForm')
    if (!form) {
        console.error('Form not found during initialization')
        return
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        console.log('Form submission started')

        try {
            const formData = new FormData(e.target)
            const data = {
                id: formData.get('id') || generateUUID(),
                destination: formData.get('destination'),
                country: formData.get('country'),
                flag: formData.get('flag'),
                image_url: formData.get('image_url'),
                price: parseInt(formData.get('price')),
                original_price: parseInt(formData.get('original_price')),
                discount: parseInt(formData.get('discount')),
                departure: formData.get('departure'),
                stops: formData.get('stops'),
                is_hot: formData.get('is_hot') === 'on',
                type: formData.get('type'),
                likes: parseInt(formData.get('likes')) || 0,
                created_at: new Date().toISOString(),
                url: formData.get('url'),
                departure_time: formData.get('departure_time'),
                arrival_time: formData.get('arrival_time'),
                flight_duration: formData.get('flight_duration'),
                posted_by: formData.get('posted_by'),
                posted_by_avatar: formData.get('posted_by_avatar'),
                posted_by_description: formData.get('posted_by_description')
            }

            console.log('Submitting data:', data)

            const { error } = await supabase
                .from('deals')
                .insert([data])

            if (error) throw error

            console.log('Deal submitted successfully')
            alert('Deal submitted successfully!')
            prefillForm()
            displayDeals()
        } catch (error) {
            console.error('Error submitting deal:', error)
            alert('Error submitting deal: ' + error.message)
        }
    })
}

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
    <form id="dealForm">
        <label for="destination">Destination:</label>
        <input type="text" id="destination" name="destination"><br><br>
        <label for="country">Country:</label>
        <input type="text" id="country" name="country"><br><br>
        <label for="flag">Flag:</label>
        <input type="text" id="flag" name="flag"><br><br>
        <label for="image_url">Image URL:</label>
        <input type="text" id="image_url" name="image_url"><br><br>
        <label for="price">Price:</label>
        <input type="number" id="price" name="price"><br><br>
        <label for="original_price">Original Price:</label>
        <input type="number" id="original_price" name="original_price"><br><br>
        <label for="discount">Discount:</label>
        <input type="number" id="discount" name="discount"><br><br>
        <label for="departure">Departure:</label>
        <input type="text" id="departure" name="departure"><br><br>
        <label for="stops">Stops:</label>
        <input type="text" id="stops" name="stops"><br><br>
        <label for="is_hot">Is Hot:</label>
        <input type="checkbox" id="is_hot" name="is_hot"><br><br>
        <label for="type">Type:</label>
        <select id="type" name="type">
            <option value="Economy">Economy</option>
            <option value="Business">Business</option>
            <option value="First Class">First Class</option>
        </select><br><br>
        <label for="likes">Likes:</label>
        <input type="number" id="likes" name="likes"><br><br>
        <label for="url">URL:</label>
        <input type="text" id="url" name="url"><br><br>
        <label for="departure_time">Departure Time:</label>
        <input type="text" id="departure_time" name="departure_time"><br><br>
        <label for="arrival_time">Arrival Time:</label>
        <input type="text" id="arrival_time" name="arrival_time"><br><br>
        <label for="flight_duration">Flight Duration:</label>
        <input type="text" id="flight_duration" name="flight_duration"><br><br>
        <label for="posted_by">Posted By:</label>
        <input type="text" id="posted_by" name="posted_by"><br><br>
        <label for="posted_by_avatar">Posted By Avatar:</label>
        <input type="text" id="posted_by_avatar" name="posted_by_avatar"><br><br>
        <label for="posted_by_description">Posted By Description:</label>
        <input type="text" id="posted_by_description" name="posted_by_description"><br><br>
        <input type="submit" value="Submit">
    </form>
    <div id="dealsList"></div>
  </div>
`

setupCounter(document.querySelector('#counter'))

// Initialize everything when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM Content Loaded')
        prefillForm()
        initializeForm()
        displayDeals()
    })
} else {
    console.log('DOM already loaded')
    prefillForm()
    initializeForm()
    displayDeals()
}
