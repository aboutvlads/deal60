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
    departure: 'New York',
    destination: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    stops: 'Non-stop',
    price: 499,
    original_price: 899,
    discount: 400,
    posted_by: 'System',
    posted_by_avatar: 'https://example.com/avatar.jpg',
    posted_by_description: 'Deal Hunter',
    type: 'Economy',
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
                                <td>${deal.destination} ${deal.flag || ''}</td>
                                <td>
                                    <div class="price-info">
                                        <span class="current-price">${formatPrice(deal.price)}</span>
                                        <span class="original-price">${formatPrice(deal.original_price)}</span>
                                    </div>
                                </td>
                                <td>${deal.departure}</td>
                                <td>${deal.type}</td>
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
                departure: formData.get('departure'),
                destination: formData.get('destination'),
                country: formData.get('country'),
                flag: formData.get('flag'),
                stops: formData.get('stops'),
                price: parseInt(formData.get('price')),
                original_price: parseInt(formData.get('original_price')),
                discount: parseInt(formData.get('discount')),
                posted_by: formData.get('posted_by'),
                posted_by_avatar: formData.get('posted_by_avatar'),
                posted_by_description: formData.get('posted_by_description'),
                type: formData.get('type'),
                departure_time: formData.get('departure_time'),
                arrival_time: formData.get('arrival_time'),
                flight_duration: formData.get('flight_duration'),
                url: formData.get('url'),
                image_url: formData.get('image_url'),
                is_hot: formData.get('is_hot') === 'on'
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

const countryEmojis = {
    'Afghanistan': '🇦🇫',
    'Albania': '🇦🇱',
    'Algeria': '🇩🇿',
    'Andorra': '🇦🇩',
    'Angola': '🇦🇴',
    'Antigua and Barbuda': '🇦🇬',
    'Argentina': '🇦🇷',
    'Armenia': '🇦🇲',
    'Australia': '🇦🇺',
    'Austria': '🇦🇹',
    'Azerbaijan': '🇦🇿',
    'Bahamas': '🇧🇸',
    'Bahrain': '🇧🇭',
    'Bangladesh': '🇧🇩',
    'Barbados': '🇧🇧',
    'Belarus': '🇧🇾',
    'Belgium': '🇧🇪',
    'Belize': '🇧🇿',
    'Benin': '🇧🇯',
    'Bhutan': '🇧🇹',
    'Bolivia': '🇧🇴',
    'Bosnia and Herzegovina': '🇧🇦',
    'Botswana': '🇧🇼',
    'Brazil': '🇧🇷',
    'Brunei': '🇧🇳',
    'Bulgaria': '🇧🇬',
    'Burkina Faso': '🇧🇫',
    'Burundi': '🇧🇮',
    'Cambodia': '🇰🇭',
    'Cameroon': '🇨🇲',
    'Canada': '🇨🇦',
    'Cape Verde': '🇨🇻',
    'Central African Republic': '🇨🇫',
    'Chad': '🇹🇩',
    'Chile': '🇨🇱',
    'China': '🇨🇳',
    'Colombia': '🇨🇴',
    'Comoros': '🇰🇲',
    'Congo': '🇨🇬',
    'Costa Rica': '🇨🇷',
    'Croatia': '🇭🇷',
    'Cuba': '🇨🇺',
    'Cyprus': '🇨🇾',
    'Czech Republic': '🇨🇿',
    'Denmark': '🇩🇰',
    'Djibouti': '🇩🇯',
    'Dominica': '🇩🇲',
    'Dominican Republic': '🇩🇴',
    'DR Congo': '🇨🇩',
    'Ecuador': '🇪🇨',
    'Egypt': '🇪🇬',
    'El Salvador': '🇸🇻',
    'Equatorial Guinea': '🇬🇶',
    'Eritrea': '🇪🇷',
    'Estonia': '🇪🇪',
    'Eswatini': '🇸🇿',
    'Ethiopia': '🇪🇹',
    'Fiji': '🇫🇯',
    'Finland': '🇫🇮',
    'France': '🇫🇷',
    'Gabon': '🇬🇦',
    'Gambia': '🇬🇲',
    'Georgia': '🇬🇪',
    'Germany': '🇩🇪',
    'Ghana': '🇬🇭',
    'Greece': '🇬🇷',
    'Grenada': '🇬🇩',
    'Guatemala': '🇬🇹',
    'Guinea': '🇬🇳',
    'Guinea-Bissau': '🇬🇼',
    'Guyana': '🇬🇾',
    'Haiti': '🇭🇹',
    'Honduras': '🇭🇳',
    'Hungary': '🇭🇺',
    'Iceland': '🇮🇸',
    'India': '🇮🇳',
    'Indonesia': '🇮🇩',
    'Iran': '🇮🇷',
    'Iraq': '🇮🇶',
    'Ireland': '🇮🇪',
    'Israel': '🇮🇱',
    'Italy': '🇮🇹',
    'Ivory Coast': '🇨🇮',
    'Jamaica': '🇯🇲',
    'Japan': '🇯🇵',
    'Jordan': '🇯🇴',
    'Kazakhstan': '🇰🇿',
    'Kenya': '🇰🇪',
    'Kiribati': '🇰🇮',
    'Kuwait': '🇰🇼',
    'Kyrgyzstan': '🇰🇬',
    'Laos': '🇱🇦',
    'Latvia': '🇱🇻',
    'Lebanon': '🇱🇧',
    'Lesotho': '🇱🇸',
    'Liberia': '🇱🇷',
    'Libya': '🇱🇾',
    'Liechtenstein': '🇱🇮',
    'Lithuania': '🇱🇹',
    'Luxembourg': '🇱🇺',
    'Madagascar': '🇲🇬',
    'Malawi': '🇲🇼',
    'Malaysia': '🇲🇾',
    'Maldives': '🇲🇻',
    'Mali': '🇲🇱',
    'Malta': '🇲🇹',
    'Marshall Islands': '🇲🇭',
    'Mauritania': '🇲🇷',
    'Mauritius': '🇲🇺',
    'Mexico': '🇲🇽',
    'Micronesia': '🇫🇲',
    'Moldova': '🇲🇩',
    'Monaco': '🇲🇨',
    'Mongolia': '🇲🇳',
    'Montenegro': '🇲🇪',
    'Morocco': '🇲🇦',
    'Mozambique': '🇲🇿',
    'Myanmar': '🇲🇲',
    'Namibia': '🇳🇦',
    'Nauru': '🇳🇷',
    'Nepal': '🇳🇵',
    'Netherlands': '🇳🇱',
    'New Zealand': '🇳🇿',
    'Nicaragua': '🇳🇮',
    'Niger': '🇳🇪',
    'Nigeria': '🇳🇬',
    'North Korea': '🇰🇵',
    'North Macedonia': '🇲🇰',
    'Norway': '🇳🇴',
    'Oman': '🇴🇲',
    'Pakistan': '🇵🇰',
    'Palau': '🇵🇼',
    'Palestine': '🇵🇸',
    'Panama': '🇵🇦',
    'Papua New Guinea': '🇵🇬',
    'Paraguay': '🇵🇾',
    'Peru': '🇵🇪',
    'Philippines': '🇵🇭',
    'Poland': '🇵🇱',
    'Portugal': '🇵🇹',
    'Qatar': '🇶🇦',
    'Romania': '🇷🇴',
    'Russia': '🇷🇺',
    'Rwanda': '🇷🇼',
    'Saint Kitts and Nevis': '🇰🇳',
    'Saint Lucia': '🇱🇨',
    'Saint Vincent and the Grenadines': '🇻🇨',
    'Samoa': '🇼🇸',
    'San Marino': '🇸🇲',
    'Sao Tome and Principe': '🇸🇹',
    'Saudi Arabia': '🇸🇦',
    'Senegal': '🇸🇳',
    'Serbia': '🇷🇸',
    'Seychelles': '🇸🇨',
    'Sierra Leone': '🇸🇱',
    'Singapore': '🇸🇬',
    'Slovakia': '🇸🇰',
    'Slovenia': '🇸🇮',
    'Solomon Islands': '🇸🇧',
    'Somalia': '🇸🇴',
    'South Africa': '🇿🇦',
    'South Korea': '🇰🇷',
    'South Sudan': '🇸🇸',
    'Spain': '🇪🇸',
    'Sri Lanka': '🇱🇰',
    'Sudan': '🇸🇩',
    'Suriname': '🇸🇷',
    'Sweden': '🇸🇪',
    'Switzerland': '🇨🇭',
    'Syria': '🇸🇾',
    'Taiwan': '🇹🇼',
    'Tajikistan': '🇹🇯',
    'Tanzania': '🇹🇿',
    'Thailand': '🇹🇭',
    'Timor-Leste': '🇹🇱',
    'Togo': '🇹🇬',
    'Tonga': '🇹🇴',
    'Trinidad and Tobago': '🇹🇹',
    'Tunisia': '🇹🇳',
    'Turkey': '🇹🇷',
    'Turkmenistan': '🇹🇲',
    'Tuvalu': '🇹🇻',
    'Uganda': '🇺🇬',
    'Ukraine': '🇺🇦',
    'United Arab Emirates': '🇦🇪',
    'United Kingdom': '🇬🇧',
    'United States': '🇺🇸',
    'Uruguay': '🇺🇾',
    'Uzbekistan': '🇺🇿',
    'Vanuatu': '🇻🇺',
    'Vatican City': '🇻🇦',
    'Venezuela': '🇻🇪',
    'Vietnam': '🇻🇳',
    'Yemen': '🇾🇪',
    'Zambia': '🇿🇲',
    'Zimbabwe': '🇿🇼'
};

const cityToCountry = {
    // Europe
    'Paris': 'France',
    'London': 'United Kingdom',
    'Rome': 'Italy',
    'Madrid': 'Spain',
    'Berlin': 'Germany',
    'Amsterdam': 'Netherlands',
    'Barcelona': 'Spain',
    'Prague': 'Czech Republic',
    'Vienna': 'Austria',
    'Venice': 'Italy',
    'Milan': 'Italy',
    'Munich': 'Germany',
    'Dublin': 'Ireland',
    'Brussels': 'Belgium',
    'Lisbon': 'Portugal',
    'Athens': 'Greece',
    'Stockholm': 'Sweden',
    'Copenhagen': 'Denmark',
    'Oslo': 'Norway',
    'Helsinki': 'Finland',
    'Zurich': 'Switzerland',
    'Geneva': 'Switzerland',
    'Budapest': 'Hungary',
    'Warsaw': 'Poland',
    'Istanbul': 'Turkey',

    // Asia
    'Tokyo': 'Japan',
    'Bangkok': 'Thailand',
    'Singapore': 'Singapore',
    'Hong Kong': 'China',
    'Dubai': 'United Arab Emirates',
    'Seoul': 'South Korea',
    'Taipei': 'Taiwan',
    'Beijing': 'China',
    'Shanghai': 'China',
    'Mumbai': 'India',
    'Delhi': 'India',
    'Kuala Lumpur': 'Malaysia',
    'Manila': 'Philippines',
    'Ho Chi Minh City': 'Vietnam',
    'Hanoi': 'Vietnam',
    'Jakarta': 'Indonesia',
    'Bali': 'Indonesia',
    'Phuket': 'Thailand',

    // Americas
    'New York': 'United States',
    'Los Angeles': 'United States',
    'Chicago': 'United States',
    'Miami': 'United States',
    'San Francisco': 'United States',
    'Las Vegas': 'United States',
    'Toronto': 'Canada',
    'Vancouver': 'Canada',
    'Montreal': 'Canada',
    'Mexico City': 'Mexico',
    'Cancun': 'Mexico',
    'Rio de Janeiro': 'Brazil',
    'Sao Paulo': 'Brazil',
    'Buenos Aires': 'Argentina',
    'Lima': 'Peru',
    'Bogota': 'Colombia',
    'Santiago': 'Chile',

    // Australia & Pacific
    'Sydney': 'Australia',
    'Melbourne': 'Australia',
    'Brisbane': 'Australia',
    'Perth': 'Australia',
    'Auckland': 'New Zealand',
    'Wellington': 'New Zealand',
    'Fiji': 'Fiji',
    'Bora Bora': 'French Polynesia',
    'Tahiti': 'French Polynesia',

    // Middle East
    'Abu Dhabi': 'United Arab Emirates',
    'Doha': 'Qatar',
    'Riyadh': 'Saudi Arabia',
    'Tel Aviv': 'Israel',
    'Jerusalem': 'Israel',
    'Cairo': 'Egypt',

    // Africa
    'Cape Town': 'South Africa',
    'Johannesburg': 'South Africa',
    'Nairobi': 'Kenya',
    'Marrakech': 'Morocco',
    'Casablanca': 'Morocco',
    'Cairo': 'Egypt',
    'Luxor': 'Egypt'
};

function updateFlag(countryName) {
    const flagInput = document.getElementById('flag');
    if (countryEmojis[countryName]) {
        flagInput.value = countryEmojis[countryName];
    }
}

function updateCountryAndFlag(city) {
    const countryInput = document.getElementById('country');
    const flagInput = document.getElementById('flag');
    const flagPicker = document.getElementById('flagPicker');
    
    // Normalize city name (capitalize first letter of each word)
    city = city.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    if (cityToCountry[city]) {
        const country = cityToCountry[city];
        countryInput.value = country;
        
        // Update flag if country exists in our emoji list
        if (countryEmojis[country]) {
            flagInput.value = countryEmojis[country];
            flagPicker.value = country;
        }
    }
}

function filterCountries(searchText) {
    const flagPicker = document.getElementById('flagPicker');
    const searchValue = searchText.toLowerCase();
    
    // Reset options
    flagPicker.innerHTML = '<option value="">Select country</option>';
    
    // Filter and add matching countries
    Object.entries(countryEmojis)
        .filter(([country]) => country.toLowerCase().includes(searchValue))
        .forEach(([country, flag]) => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = `${flag} ${country}`;
            flagPicker.appendChild(option);
        });
}

document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1>Travel Deals Manager</h1>
    
    <form id="dealForm" class="deal-form">
      <input type="hidden" id="id" name="id">
      
      <div class="form-grid">
        <div class="form-group">
          <label for="departure">From:</label>
          <input type="text" id="departure" name="departure" required>
        </div>

        <div class="form-group">
          <label for="destination">To:</label>
          <input type="text" id="destination" name="destination" required 
                 oninput="updateCountryAndFlag(this.value)" 
                 placeholder="Enter city name">
        </div>

        <div class="form-group">
          <label for="country">To (country):</label>
          <input type="text" id="country" name="country" required>
        </div>

        <div class="form-group">
          <label for="flag">To (country emoji):</label>
          <div class="flag-input-group">
            <input type="text" id="flag" name="flag" placeholder="e.g. 🇫🇷">
            <div class="flag-picker-container">
              <input type="text" id="countrySearch" placeholder="Search country..." class="country-search">
              <select id="flagPicker" onchange="updateFlag(this.value)" class="flag-picker">
                <option value="">Select country</option>
                ${Object.entries(countryEmojis).map(([country, flag]) => 
                  `<option value="${country}">${flag} ${country}</option>`
                ).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="stops">Travel Dates • Stops:</label>
          <input type="text" id="stops" name="stops" placeholder="e.g. Jan 15-22 • Non-stop" required>
        </div>

        <div class="form-group">
          <label for="price">Discount price:</label>
          <input type="number" id="price" name="price" required>
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
          <label for="type">Cabin Type:</label>
          <select id="type" name="type" required>
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

document.getElementById('countrySearch')?.addEventListener('input', (e) => filterCountries(e.target.value));

// Make functions available globally
window.editDeal = editDeal;
window.deleteDeal = deleteDeal;
window.updateFlag = updateFlag;
window.filterCountries = filterCountries;
window.updateCountryAndFlag = updateCountryAndFlag;

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
