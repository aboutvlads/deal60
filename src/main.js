import { createClient } from '@supabase/supabase-js'
import './style.css'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vjaolwcexcjblstbsyoj.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYW9sd2NleGNqYmxzdGJzeW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NDQ3OTAsImV4cCI6MjA1MDIyMDc5MH0.ITA8YP8f1Yj_MJuyqr6GjFYGmhpnM5x5LGpw4sfbDJw'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let isAuthenticated = false;

async function checkAuth() {
    const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', 'aboutvlad')
        .single()

    if (error) {
        console.error('Error checking auth:', error)
        return false
    }

    return data !== null
}

async function login(username, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: username + '@temp.com',  // Supabase requires email format
        password: password
    })

    if (data?.user) {
        isAuthenticated = true
        document.getElementById('loginForm').style.display = 'none'
        document.getElementById('app').style.display = 'block'
        return true
    }

    if (error) {
        console.error('Error logging in:', error.message)
    }
    return false
}

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        isAuthenticated = true
        document.getElementById('loginForm').style.display = 'none'
        document.getElementById('app').style.display = 'block'
    } else {
        isAuthenticated = false
        document.getElementById('loginForm').style.display = 'flex'
        document.getElementById('app').style.display = 'none'
    }
})

// Add login form HTML before the app div
document.body.insertAdjacentHTML('afterbegin', `
    <div id="loginForm" class="login-container">
        <div class="login-form">
            <h2>Login to Deals Manager</h2>
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" required>
            </div>
            <button id="loginButton" class="login-btn">Login</button>
            <p id="loginError" class="error-message" style="display: none; color: red; margin-top: 10px;"></p>
        </div>
    </div>
`)

// Add login styles
const loginStyles = `
    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: var(--background-color);
    }

    .login-form {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: var(--shadow-md);
        width: 100%;
        max-width: 400px;
    }

    .login-form h2 {
        margin-bottom: 1.5rem;
        text-align: center;
        color: var(--text-color);
    }

    .login-btn {
        width: 100%;
        padding: 0.75rem;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        margin-top: 1rem;
    }

    .login-btn:hover {
        background-color: var(--primary-hover);
    }
`

// Add login styles to the document
const loginStyleSheet = document.createElement('style')
loginStyleSheet.textContent = loginStyles
document.head.appendChild(loginStyleSheet)

// Hide the main app initially
document.getElementById('app').style.display = 'none'

// Add login form event listener
document.getElementById('loginButton').addEventListener('click', async () => {
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    const errorElement = document.getElementById('loginError')

    if (!username || !password) {
        errorElement.textContent = 'Please enter both username and password'
        errorElement.style.display = 'block'
        return
    }

    const success = await login(username, password)
    if (!success) {
        errorElement.textContent = 'Invalid username or password'
        errorElement.style.display = 'block'
    }
})

const UNSPLASH_ACCESS_KEY = 'JLkM54mnaCL1pz6-FggtyOZNIV7B7p6cNFx8wmCFR-0'; // You'll need to replace this with a real Unsplash API key

let isEditing = false;
let editingId = null;

// Country data with emojis
const countries = [
    { name: 'Afghanistan', code: 'AF', emoji: '🇦🇫' },
    { name: 'Albania', code: 'AL', emoji: '🇦🇱' },
    { name: 'Algeria', code: 'DZ', emoji: '🇩🇿' },
    { name: 'Andorra', code: 'AD', emoji: '🇦🇩' },
    { name: 'Angola', code: 'AO', emoji: '🇦🇴' },
    { name: 'Antigua and Barbuda', code: 'AG', emoji: '🇦🇬' },
    { name: 'Argentina', code: 'AR', emoji: '🇦🇷' },
    { name: 'Armenia', code: 'AM', emoji: '🇦🇲' },
    { name: 'Australia', code: 'AU', emoji: '🇦🇺' },
    { name: 'Austria', code: 'AT', emoji: '🇦🇹' },
    { name: 'Azerbaijan', code: 'AZ', emoji: '🇦🇿' },
    { name: 'Bahamas', code: 'BS', emoji: '🇧🇸' },
    { name: 'Bahrain', code: 'BH', emoji: '🇧🇭' },
    { name: 'Bangladesh', code: 'BD', emoji: '🇧🇩' },
    { name: 'Barbados', code: 'BB', emoji: '🇧🇧' },
    { name: 'Belarus', code: 'BY', emoji: '🇧🇾' },
    { name: 'Belgium', code: 'BE', emoji: '🇧🇪' },
    { name: 'Belize', code: 'BZ', emoji: '🇧🇿' },
    { name: 'Benin', code: 'BJ', emoji: '🇧🇯' },
    { name: 'Bhutan', code: 'BT', emoji: '🇧🇹' },
    { name: 'Bolivia', code: 'BO', emoji: '🇧🇴' },
    { name: 'Bosnia and Herzegovina', code: 'BA', emoji: '🇧🇦' },
    { name: 'Botswana', code: 'BW', emoji: '🇧🇼' },
    { name: 'Brazil', code: 'BR', emoji: '🇧🇷' },
    { name: 'Brunei', code: 'BN', emoji: '🇧🇳' },
    { name: 'Bulgaria', code: 'BG', emoji: '🇧🇬' },
    { name: 'Burkina Faso', code: 'BF', emoji: '🇧🇫' },
    { name: 'Burundi', code: 'BI', emoji: '🇧🇮' },
    { name: 'Cambodia', code: 'KH', emoji: '🇰🇭' },
    { name: 'Cameroon', code: 'CM', emoji: '🇨🇲' },
    { name: 'Canada', code: 'CA', emoji: '🇨🇦' },
    { name: 'Cape Verde', code: 'CV', emoji: '🇨🇻' },
    { name: 'Central African Republic', code: 'CF', emoji: '🇨🇫' },
    { name: 'Chad', code: 'TD', emoji: '🇹🇩' },
    { name: 'Chile', code: 'CL', emoji: '🇨🇱' },
    { name: 'China', code: 'CN', emoji: '🇨🇳' },
    { name: 'Colombia', code: 'CO', emoji: '🇨🇴' },
    { name: 'Comoros', code: 'KM', emoji: '🇰🇲' },
    { name: 'Congo', code: 'CG', emoji: '🇨🇬' },
    { name: 'Costa Rica', code: 'CR', emoji: '🇨🇷' },
    { name: 'Croatia', code: 'HR', emoji: '🇭🇷' },
    { name: 'Cuba', code: 'CU', emoji: '🇨🇺' },
    { name: 'Cyprus', code: 'CY', emoji: '🇨🇾' },
    { name: 'Czech Republic', code: 'CZ', emoji: '🇨🇿' },
    { name: 'Denmark', code: 'DK', emoji: '🇩🇰' },
    { name: 'Djibouti', code: 'DJ', emoji: '🇩🇯' },
    { name: 'Dominica', code: 'DM', emoji: '🇩🇲' },
    { name: 'Dominican Republic', code: 'DO', emoji: '🇩🇴' },
    { name: 'East Timor', code: 'TL', emoji: '🇹🇱' },
    { name: 'Ecuador', code: 'EC', emoji: '🇪🇨' },
    { name: 'Egypt', code: 'EG', emoji: '🇪🇬' },
    { name: 'El Salvador', code: 'SV', emoji: '🇸🇻' },
    { name: 'Equatorial Guinea', code: 'GQ', emoji: '🇬🇶' },
    { name: 'Eritrea', code: 'ER', emoji: '🇪🇷' },
    { name: 'Estonia', code: 'EE', emoji: '🇪🇪' },
    { name: 'Ethiopia', code: 'ET', emoji: '🇪🇹' },
    { name: 'Fiji', code: 'FJ', emoji: '🇫🇯' },
    { name: 'Finland', code: 'FI', emoji: '🇫🇮' },
    { name: 'France', code: 'FR', emoji: '🇫🇷' },
    { name: 'Gabon', code: 'GA', emoji: '🇬🇦' },
    { name: 'Gambia', code: 'GM', emoji: '🇬🇲' },
    { name: 'Georgia', code: 'GE', emoji: '🇬🇪' },
    { name: 'Germany', code: 'DE', emoji: '🇩🇪' },
    { name: 'Ghana', code: 'GH', emoji: '🇬🇭' },
    { name: 'Greece', code: 'GR', emoji: '🇬🇷' },
    { name: 'Grenada', code: 'GD', emoji: '🇬🇩' },
    { name: 'Guatemala', code: 'GT', emoji: '🇬🇹' },
    { name: 'Guinea', code: 'GN', emoji: '🇬🇳' },
    { name: 'Guinea-Bissau', code: 'GW', emoji: '🇬🇼' },
    { name: 'Guyana', code: 'GY', emoji: '🇬🇾' },
    { name: 'Haiti', code: 'HT', emoji: '🇭🇹' },
    { name: 'Honduras', code: 'HN', emoji: '🇭🇳' },
    { name: 'Hungary', code: 'HU', emoji: '🇭🇺' },
    { name: 'Iceland', code: 'IS', emoji: '🇮🇸' },
    { name: 'India', code: 'IN', emoji: '🇮🇳' },
    { name: 'Indonesia', code: 'ID', emoji: '🇮🇩' },
    { name: 'Iran', code: 'IR', emoji: '🇮🇷' },
    { name: 'Iraq', code: 'IQ', emoji: '🇮🇶' },
    { name: 'Ireland', code: 'IE', emoji: '🇮🇪' },
    { name: 'Israel', code: 'IL', emoji: '🇮🇱' },
    { name: 'Italy', code: 'IT', emoji: '🇮🇹' },
    { name: 'Jamaica', code: 'JM', emoji: '🇯🇲' },
    { name: 'Japan', code: 'JP', emoji: '🇯🇵' },
    { name: 'Jordan', code: 'JO', emoji: '🇯🇴' },
    { name: 'Kazakhstan', code: 'KZ', emoji: '🇰🇿' },
    { name: 'Kenya', code: 'KE', emoji: '🇰🇪' },
    { name: 'Kiribati', code: 'KI', emoji: '🇰🇮' },
    { name: 'Kuwait', code: 'KW', emoji: '🇰🇼' },
    { name: 'Kyrgyzstan', code: 'KG', emoji: '🇰🇬' },
    { name: 'Laos', code: 'LA', emoji: '🇱🇦' },
    { name: 'Latvia', code: 'LV', emoji: '🇱🇻' },
    { name: 'Lebanon', code: 'LB', emoji: '🇱🇧' },
    { name: 'Lesotho', code: 'LS', emoji: '🇱🇸' },
    { name: 'Liberia', code: 'LR', emoji: '🇱🇷' },
    { name: 'Libya', code: 'LY', emoji: '🇱🇾' },
    { name: 'Liechtenstein', code: 'LI', emoji: '🇱🇮' },
    { name: 'Lithuania', code: 'LT', emoji: '🇱🇹' },
    { name: 'Luxembourg', code: 'LU', emoji: '🇱🇺' },
    { name: 'Madagascar', code: 'MG', emoji: '🇲🇬' },
    { name: 'Malawi', code: 'MW', emoji: '🇲🇼' },
    { name: 'Malaysia', code: 'MY', emoji: '🇲🇾' },
    { name: 'Maldives', code: 'MV', emoji: '🇲🇻' },
    { name: 'Mali', code: 'ML', emoji: '🇲🇱' },
    { name: 'Malta', code: 'MT', emoji: '🇲🇹' },
    { name: 'Marshall Islands', code: 'MH', emoji: '🇲🇭' },
    { name: 'Mauritania', code: 'MR', emoji: '🇲🇷' },
    { name: 'Mauritius', code: 'MU', emoji: '🇲🇺' },
    { name: 'Mexico', code: 'MX', emoji: '🇲🇽' },
    { name: 'Micronesia', code: 'FM', emoji: '🇫🇲' },
    { name: 'Moldova', code: 'MD', emoji: '🇲🇩' },
    { name: 'Monaco', code: 'MC', emoji: '🇲🇨' },
    { name: 'Mongolia', code: 'MN', emoji: '🇲🇳' },
    { name: 'Montenegro', code: 'ME', emoji: '🇲🇪' },
    { name: 'Morocco', code: 'MA', emoji: '🇲🇦' },
    { name: 'Mozambique', code: 'MZ', emoji: '🇲🇿' },
    { name: 'Myanmar', code: 'MM', emoji: '🇲🇲' },
    { name: 'Namibia', code: 'NA', emoji: '🇳🇦' },
    { name: 'Nauru', code: 'NR', emoji: '🇳🇷' },
    { name: 'Nepal', code: 'NP', emoji: '🇳🇵' },
    { name: 'Netherlands', code: 'NL', emoji: '🇳🇱' },
    { name: 'New Zealand', code: 'NZ', emoji: '🇳🇿' },
    { name: 'Nicaragua', code: 'NI', emoji: '🇳🇮' },
    { name: 'Niger', code: 'NE', emoji: '🇳🇪' },
    { name: 'Nigeria', code: 'NG', emoji: '🇳🇬' },
    { name: 'North Korea', code: 'KP', emoji: '🇰🇵' },
    { name: 'North Macedonia', code: 'MK', emoji: '🇲🇰' },
    { name: 'Norway', code: 'NO', emoji: '🇳🇴' },
    { name: 'Oman', code: 'OM', emoji: '🇴🇲' },
    { name: 'Pakistan', code: 'PK', emoji: '🇵🇰' },
    { name: 'Palau', code: 'PW', emoji: '🇵🇼' },
    { name: 'Palestine', code: 'PS', emoji: '🇵🇸' },
    { name: 'Panama', code: 'PA', emoji: '🇵🇦' },
    { name: 'Papua New Guinea', code: 'PG', emoji: '🇵🇬' },
    { name: 'Paraguay', code: 'PY', emoji: '🇵🇾' },
    { name: 'Peru', code: 'PE', emoji: '🇵🇪' },
    { name: 'Philippines', code: 'PH', emoji: '🇵🇭' },
    { name: 'Poland', code: 'PL', emoji: '🇵🇱' },
    { name: 'Portugal', code: 'PT', emoji: '🇵🇹' },
    { name: 'Qatar', code: 'QA', emoji: '🇶🇦' },
    { name: 'Romania', code: 'RO', emoji: '🇷🇴' },
    { name: 'Russia', code: 'RU', emoji: '🇷🇺' },
    { name: 'Rwanda', code: 'RW', emoji: '🇷🇼' },
    { name: 'Saint Kitts and Nevis', code: 'KN', emoji: '🇰🇳' },
    { name: 'Saint Lucia', code: 'LC', emoji: '🇱🇨' },
    { name: 'Saint Vincent and the Grenadines', code: 'VC', emoji: '🇻🇨' },
    { name: 'Samoa', code: 'WS', emoji: '🇼🇸' },
    { name: 'San Marino', code: 'SM', emoji: '🇸🇲' },
    { name: 'Sao Tome and Principe', code: 'ST', emoji: '🇸🇹' },
    { name: 'Saudi Arabia', code: 'SA', emoji: '🇸🇦' },
    { name: 'Senegal', code: 'SN', emoji: '🇸🇳' },
    { name: 'Serbia', code: 'RS', emoji: '🇷🇸' },
    { name: 'Seychelles', code: 'SC', emoji: '🇸🇨' },
    { name: 'Sierra Leone', code: 'SL', emoji: '🇸🇱' },
    { name: 'Singapore', code: 'SG', emoji: '🇸🇬' },
    { name: 'Slovakia', code: 'SK', emoji: '🇸🇰' },
    { name: 'Slovenia', code: 'SI', emoji: '🇸🇮' },
    { name: 'Solomon Islands', code: 'SB', emoji: '🇸🇧' },
    { name: 'Somalia', code: 'SO', emoji: '🇸🇴' },
    { name: 'South Africa', code: 'ZA', emoji: '🇿🇦' },
    { name: 'South Korea', code: 'KR', emoji: '🇰🇷' },
    { name: 'South Sudan', code: 'SS', emoji: '🇸🇸' },
    { name: 'Spain', code: 'ES', emoji: '🇪🇸' },
    { name: 'Sri Lanka', code: 'LK', emoji: '🇱🇰' },
    { name: 'Sudan', code: 'SD', emoji: '🇸🇩' },
    { name: 'Suriname', code: 'SR', emoji: '🇸🇷' },
    { name: 'Sweden', code: 'SE', emoji: '🇸🇪' },
    { name: 'Switzerland', code: 'CH', emoji: '🇨🇭' },
    { name: 'Syria', code: 'SY', emoji: '🇸🇾' },
    { name: 'Taiwan', code: 'TW', emoji: '🇹🇼' },
    { name: 'Tajikistan', code: 'TJ', emoji: '🇹🇯' },
    { name: 'Tanzania', code: 'TZ', emoji: '🇹🇿' },
    { name: 'Thailand', code: 'TH', emoji: '🇹🇭' },
    { name: 'Togo', code: 'TG', emoji: '🇹🇬' },
    { name: 'Tonga', code: 'TO', emoji: '🇹🇴' },
    { name: 'Trinidad and Tobago', code: 'TT', emoji: '🇹🇹' },
    { name: 'Tunisia', code: 'TN', emoji: '🇹🇳' },
    { name: 'Turkey', code: 'TR', emoji: '🇹🇷' },
    { name: 'Turkmenistan', code: 'TM', emoji: '🇹🇲' },
    { name: 'Tuvalu', code: 'TV', emoji: '🇹🇻' },
    { name: 'Uganda', code: 'UG', emoji: '🇺🇬' },
    { name: 'Ukraine', code: 'UA', emoji: '🇺🇦' },
    { name: 'United Arab Emirates', code: 'AE', emoji: '🇦🇪' },
    { name: 'United Kingdom', code: 'GB', emoji: '🇬🇧' },
    { name: 'United States', code: 'US', emoji: '🇺🇸' },
    { name: 'Uruguay', code: 'UY', emoji: '🇺🇾' },
    { name: 'Uzbekistan', code: 'UZ', emoji: '🇺🇿' },
    { name: 'Vanuatu', code: 'VU', emoji: '🇻🇺' },
    { name: 'Vatican City', code: 'VA', emoji: '🇻🇦' },
    { name: 'Venezuela', code: 'VE', emoji: '🇻🇪' },
    { name: 'Vietnam', code: 'VN', emoji: '🇻🇳' },
    { name: 'Yemen', code: 'YE', emoji: '🇾🇪' },
    { name: 'Zambia', code: 'ZM', emoji: '🇿🇲' },
    { name: 'Zimbabwe', code: 'ZW', emoji: '🇿🇼' }
];

const CITY_TO_COUNTRY = {
    'paris': { country: 'France', code: 'FR' },
    'london': { country: 'United Kingdom', code: 'GB' },
    'new york': { country: 'United States', code: 'US' },
    'tokyo': { country: 'Japan', code: 'JP' },
    'rome': { country: 'Italy', code: 'IT' },
    'berlin': { country: 'Germany', code: 'DE' },
    'madrid': { country: 'Spain', code: 'ES' },
    'amsterdam': { country: 'Netherlands', code: 'NL' },
    'bangkok': { country: 'Thailand', code: 'TH' },
    'dubai': { country: 'United Arab Emirates', code: 'AE' },
    'singapore': { country: 'Singapore', code: 'SG' },
    'sydney': { country: 'Australia', code: 'AU' },
    'istanbul': { country: 'Turkey', code: 'TR' },
    'moscow': { country: 'Russia', code: 'RU' },
    'beijing': { country: 'China', code: 'CN' },
    'seoul': { country: 'South Korea', code: 'KR' },
    'vienna': { country: 'Austria', code: 'AT' },
    'prague': { country: 'Czech Republic', code: 'CZ' },
    'lisbon': { country: 'Portugal', code: 'PT' },
    'athens': { country: 'Greece', code: 'GR' },
    'venice': { country: 'Italy', code: 'IT' },
    'barcelona': { country: 'Spain', code: 'ES' },
    'milan': { country: 'Italy', code: 'IT' },
    'munich': { country: 'Germany', code: 'DE' },
    'zurich': { country: 'Switzerland', code: 'CH' },
    'stockholm': { country: 'Sweden', code: 'SE' },
    'oslo': { country: 'Norway', code: 'NO' },
    'copenhagen': { country: 'Denmark', code: 'DK' },
    'dublin': { country: 'Ireland', code: 'IE' },
    'brussels': { country: 'Belgium', code: 'BE' }
};

const PREDEFINED_USERS = [
    {
        name: 'Vlad',
        avatar: 'https://pbs.twimg.com/profile_images/1861513689720881152/86GYfxoC_400x400.jpg',
        description: 'Deal Hunter'
    },
    {
        name: 'Alex',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        description: 'Travel Enthusiast'
    },
    {
        name: 'Emma',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        description: 'Budget Travel Expert'
    },
    {
        name: 'Marco',
        avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
        description: 'Airline Deals Specialist'
    }
];

async function fetchUnsplashImages(query) {
    try {
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=9`, {
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching Unsplash images:', error);
        return [];
    }
}

async function uploadScreenshot(file) {
    try {
        const timestamp = new Date().getTime();
        const fileExt = file.name.split('.').pop();
        const filePath = `public/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Create anonymous Supabase client
        const anonymousClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        const { data: uploadData, error: uploadError } = await anonymousClient.storage
            .from('screenshots')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = anonymousClient.storage
            .from('screenshots')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading screenshot:', error);
        throw error;
    }
}

function setupCountrySearch() {
    const countryInput = document.getElementById('country');
    const flagInput = document.getElementById('flag');
    const countryList = document.createElement('div');
    countryList.className = 'country-list';
    countryInput.parentNode.appendChild(countryList);

    countryInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const matches = countries.filter(country => 
            country.name.toLowerCase().includes(searchTerm)
        );

        if (searchTerm && matches.length > 0) {
            countryList.innerHTML = matches
                .slice(0, 5) // Show only first 5 matches
                .map(country => `
                    <div class="country-item" data-name="${country.name}" data-emoji="${country.emoji}">
                        ${country.emoji} ${country.name}
                    </div>
                `).join('');
            countryList.style.display = 'block';
        } else {
            countryList.style.display = 'none';
        }
    });

    countryList.addEventListener('click', function(e) {
        const item = e.target.closest('.country-item');
        if (item) {
            const countryName = item.dataset.name;
            const emoji = item.dataset.emoji;
            countryInput.value = countryName;
            flagInput.value = emoji;
            countryList.style.display = 'none';
        }
    });

    // Hide country list when clicking outside
    document.addEventListener('click', function(e) {
        if (!countryInput.contains(e.target) && !countryList.contains(e.target)) {
            countryList.style.display = 'none';
        }
    });
}

function setupDestinationCountryAutoFill() {
    const destinationInput = document.getElementById('destination');
    const countryInput = document.getElementById('country');
    const flagInput = document.getElementById('flag');

    destinationInput.addEventListener('input', (e) => {
        const city = e.target.value.toLowerCase().trim();
        const cityInfo = CITY_TO_COUNTRY[city];

        if (cityInfo) {
            // Find the country in our countries array
            const countryData = countries.find(c => c.code === cityInfo.code);
            if (countryData) {
                countryInput.value = countryData.name;
                flagInput.value = countryData.emoji;
            }
        }
    });
}

function setupPostedByDropdown() {
    const postedByInput = document.getElementById('posted_by');
    const postedByAvatarInput = document.getElementById('posted_by_avatar');
    const postedByDescriptionInput = document.getElementById('posted_by_description');

    // Create dropdown
    const dropdown = document.createElement('select');
    dropdown.id = 'posted_by_dropdown';
    dropdown.className = 'posted-by-dropdown';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a Deal Hunter';
    dropdown.appendChild(defaultOption);

    // Add predefined users to dropdown
    PREDEFINED_USERS.forEach((user, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = user.name;
        dropdown.appendChild(option);
    });

    // Insert dropdown before the existing input
    postedByInput.parentNode.insertBefore(dropdown, postedByInput);
    postedByInput.style.display = 'none'; // Hide the original input

    // Add event listener to update inputs when dropdown changes
    dropdown.addEventListener('change', (e) => {
        const selectedIndex = e.target.value;
        if (selectedIndex !== '') {
            const selectedUser = PREDEFINED_USERS[selectedIndex];
            postedByInput.value = selectedUser.name;
            postedByAvatarInput.value = selectedUser.avatar;
            postedByDescriptionInput.value = selectedUser.description;
        } else {
            // Reset inputs if no user is selected
            postedByInput.value = '';
            postedByAvatarInput.value = '';
            postedByDescriptionInput.value = '';
        }
    });
}

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
    country: '',
    flag: '',
    travel_stops: 'Direct',
    price: 299,
    original_price: 599,
    posted_by: '',
    posted_by_avatar: '',
    posted_by_description: '',
    url: 'https://example.com',
    image_url: '',
    is_hot: false,
    sample_dates: '',
    deal_screenshot_url: '',
    trip_type: 'roundtrip',
    dates: '',
    route: '',
    baggage_allowance: ''
}

async function initializeForm() {
    const form = document.getElementById('dealForm')
    if (!form) return

    // Remove the authentication requirement
    // await signInWithEmail()
    setupCountrySearch()
    setupPostedByDropdown()
    setupDestinationCountryAutoFill()

    // Setup screenshot upload and URL input
    const screenshotInput = document.getElementById('deal_screenshot');
    const previewDiv = screenshotInput.nextElementSibling;

    // Create file upload button
    const uploadButton = document.createElement('button');
    uploadButton.type = 'button';
    uploadButton.textContent = '📤 Upload Image';
    uploadButton.className = 'upload-image-btn';

    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // Add upload button next to URL input
    screenshotInput.parentNode.insertBefore(uploadButton, screenshotInput.nextSibling);
    screenshotInput.parentNode.insertBefore(fileInput, uploadButton);

    // Handle file selection
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            uploadButton.disabled = true;
            uploadButton.textContent = 'Uploading...';
            
            // Show loading preview
            previewDiv.innerHTML = '<div class="loading-spinner">Uploading...</div>';

            // Upload file and get URL
            const publicUrl = await uploadScreenshot(file);
            
            // Update URL input and preview
            screenshotInput.value = publicUrl;
            previewDiv.innerHTML = `<img src="${publicUrl}" alt="Screenshot preview">`;
        } catch (error) {
            alert('Error uploading image: ' + error.message);
            previewDiv.innerHTML = '';
        } finally {
            uploadButton.disabled = false;
            uploadButton.textContent = '📤 Upload Image';
        }
    });

    // Click handler for upload button
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    // URL input preview handler
    screenshotInput.addEventListener('input', (e) => {
        const url = e.target.value;
        if (url) {
            previewDiv.innerHTML = `<img src="${url}" alt="Screenshot preview" onerror="this.src=''; this.alt='Invalid image URL'">`;
        } else {
            previewDiv.innerHTML = '';
        }
    });

    // Setup destination-based image suggestions
    const destinationInput = document.getElementById('destination');
    const imageUrlInput = document.getElementById('image_url');
    const suggestionContainer = document.createElement('div');
    suggestionContainer.className = 'image-suggestions';

    // Create and add the suggestion button
    const suggestButton = document.createElement('button');
    suggestButton.type = 'button';
    suggestButton.textContent = '🖼 Suggest Images';
    suggestButton.className = 'suggest-images-btn';

    imageUrlInput.parentNode.insertBefore(suggestButton, imageUrlInput.nextSibling);
    imageUrlInput.parentNode.insertBefore(suggestionContainer, suggestButton.nextSibling);

    suggestButton.addEventListener('click', async () => {
        const destination = destinationInput.value;
        if (!destination) {
            alert('Please enter a destination first');
            return;
        }

        suggestButton.disabled = true;
        suggestButton.textContent = 'Loading...';
        suggestionContainer.innerHTML = 'Loading suggestions...';

        const images = await fetchUnsplashImages(destination + ' city');
        
        if (images.length === 0) {
            suggestionContainer.innerHTML = 'No images found. Try a different destination.';
            suggestButton.disabled = false;
            suggestButton.textContent = '🖼 Suggest Images';
            return;
        }

        suggestionContainer.innerHTML = images.map(img => `
            <div class="suggestion-item" onclick="selectUnsplashImage('${img.urls.regular}')">
                <img src="${img.urls.thumb}" alt="${img.alt_description || destination}">
                <span class="credit">Photo by ${img.user.name} on Unsplash</span>
            </div>
        `).join('');

        suggestButton.disabled = false;
        suggestButton.textContent = '🖼 Suggest Images';
    });

    // Add the selectUnsplashImage function to window scope
    window.selectUnsplashImage = (url) => {
        imageUrlInput.value = url;
        suggestionContainer.innerHTML = ''; // Clear suggestions after selection
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        form.classList.add('loading')

        try {
            const formData = new FormData(e.target)
            const travelStops = formData.get('travel_stops')

            const data = {
                id: formData.get('id'),
                departure: formData.get('departure'),
                destination: formData.get('destination'),
                country: formData.get('country'),
                flag: formData.get('flag'),
                stops: travelStops,
                price: parseInt(formData.get('price')),
                original_price: parseInt(formData.get('original_price')),
                posted_by: formData.get('posted_by'),
                posted_by_avatar: formData.get('posted_by_avatar'),
                posted_by_description: formData.get('posted_by_description'),
                url: formData.get('url'),
                image_url: formData.get('image_url'),
                is_hot: formData.get('is_hot') === 'on',
                sample_dates: formData.get('sample_dates'),
                deal_screenshot_url: formData.get('deal_screenshot'),
                trip_type: formData.get('trip_type'),
                dates: formData.get('dates'),
                route: formData.get('route'),
                baggage_allowance: formData.get('baggage_allowance')
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
          <label for="departure">From:</label>
          <input type="text" id="departure" name="departure" required placeholder="e.g., JFK, New York">
        </div>

        <div class="form-group">
          <label for="destination">To:</label>
          <input type="text" id="destination" name="destination" required placeholder="e.g., Paris">
        </div>

        <div class="form-group">
          <label for="country">Country:</label>
          <input type="text" id="country" name="country" required placeholder="e.g., France">
        </div>

        <div class="form-group">
          <label for="flag">Flag:</label>
          <input type="text" id="flag" name="flag" required>
        </div>

        <div class="form-group">
          <label for="travel_stops">Stops:</label>
          <select id="travel_stops" name="travel_stops" required>
            <option value="Direct">Direct</option>
            <option value="1 Stop">1 Stop</option>
            <option value="2+ Stops">2+ Stops</option>
          </select>
        </div>

        <div class="form-group">
          <label for="price">Price:</label>
          <input type="number" id="price" name="price" required>
        </div>

        <div class="form-group">
          <label for="original_price">Original Price:</label>
          <input type="number" id="original_price" name="original_price" required>
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
          <label for="url">URL:</label>
          <input type="url" id="url" name="url" required>
        </div>

        <div class="form-group">
          <label for="image_url">Image URL:</label>
          <input type="url" id="image_url" name="image_url" required>
          <div class="unsplash-search">
            <input type="text" id="unsplashQuery" placeholder="Custom search term (optional)">
            <button type="button" onclick="suggestImages()" class="suggest-btn">Suggest Images</button>
          </div>
          <div class="image-suggestions"></div>
        </div>

        <div class="form-group">
          <label for="sample_dates">Sample Dates:</label>
          <textarea id="sample_dates" name="sample_dates" rows="3" required placeholder="e.g., 31 Dec – 9 Jan&#10;15 – 26 Jan"></textarea>
        </div>

        <div class="form-group">
          <label for="deal_screenshot">Deal Screenshot URL:</label>
          <input type="url" id="deal_screenshot" name="deal_screenshot" required>
          <div class="upload-preview"></div>
        </div>

        <div class="form-group">
          <label for="trip_type">Trip Type:</label>
          <select id="trip_type" name="trip_type" required>
            <option value="roundtrip">Round Trip</option>
            <option value="oneway">One Way</option>
          </select>
        </div>

        <div class="form-group">
          <label for="dates">Dates:</label>
          <input type="text" id="dates" name="dates" required placeholder="e.g., May-Jan">
        </div>

        <div class="form-group">
          <label for="route">Route:</label>
          <input type="text" id="route" name="route" required placeholder="e.g., Direct or via specific cities">
        </div>

        <div class="form-group">
          <label for="baggage_allowance">Baggage Allowance:</label>
          <input type="text" id="baggage_allowance" name="baggage_allowance" required placeholder="e.g., 23kg checked bag">
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

const styles = `
    :root {
        --primary-color: #2563eb;
        --primary-hover: #1d4ed8;
        --success-color: #22c55e;
        --danger-color: #ef4444;
        --border-color: #e5e7eb;
        --text-color: #1f2937;
        --background-color: #f9fafb;
        --card-background: #ffffff;
        --input-background: #ffffff;
        --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.5;
        color: var(--text-color);
        background-color: var(--background-color);
        margin: 0;
        padding: 20px;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    #dealForm {
        background: var(--card-background);
        border-radius: 12px;
        padding: 24px;
        box-shadow: var(--shadow-md);
        margin-bottom: 30px;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
    }

    .form-group {
        margin-bottom: 0;
    }

    .form-group label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--text-color);
    }

    .form-group input[type="text"],
    .form-group input[type="number"],
    .form-group input[type="url"],
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background-color: var(--input-background);
        font-size: 14px;
        transition: all 0.2s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .checkbox-group input[type="checkbox"] {
        width: 16px;
        height: 16px;
        margin-right: 8px;
    }

    button {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    button:hover {
        background-color: var(--primary-hover);
    }

    .upload-btn,
    .suggest-images-btn {
        background-color: var(--primary-color);
        margin-top: 8px;
        font-size: 14px;
    }

    .deals-table-container {
        background: var(--card-background);
        border-radius: 12px;
        padding: 16px;
        box-shadow: var(--shadow-md);
        overflow-x: auto;
    }

    .deals-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }

    .deals-table th {
        background-color: var(--background-color);
        padding: 12px 16px;
        text-align: left;
        font-weight: 500;
        border-bottom: 2px solid var(--border-color);
    }

    .deals-table td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-color);
        vertical-align: middle;
    }

    .deals-table tr:hover {
        background-color: var(--background-color);
    }

    .price-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .current-price {
        font-weight: 600;
        color: var(--success-color);
    }

    .original-price {
        text-decoration: line-through;
        color: #6b7280;
        font-size: 12px;
    }

    .action-buttons {
        display: flex;
        gap: 8px;
    }

    .edit-btn,
    .delete-btn {
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 6px;
    }

    .edit-btn {
        background-color: var(--primary-color);
    }

    .delete-btn {
        background-color: var(--danger-color);
    }

    .image-suggestions {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
        margin-top: 16px;
    }

    .image-suggestion {
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s ease;
    }

    .image-suggestion:hover {
        transform: scale(1.05);
    }

    .image-suggestion img {
        width: 100%;
        height: 100px;
        object-fit: cover;
    }

    .upload-preview {
        margin-top: 8px;
        border-radius: 8px;
        overflow: hidden;
    }

    .upload-preview img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
    }

    @media (max-width: 768px) {
        .container {
            padding: 10px;
        }

        #dealForm {
            padding: 16px;
        }

        .form-grid {
            grid-template-columns: 1fr;
        }

        .deals-table th,
        .deals-table td {
            padding: 8px;
        }

        .action-buttons {
            flex-direction: column;
        }
    }

    /* Loading state styles */
    .loading {
        opacity: 0.7;
        pointer-events: none;
    }

    .loading button[type="submit"]::after {
        content: '';
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-left: 8px;
        border: 2px solid #ffffff;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

const additionalStyles = `
    .unsplash-search {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }

    .unsplash-search input {
        flex: 1;
        padding: 8px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
    }

    .suggest-btn {
        padding: 8px 16px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .suggest-btn:hover {
        background-color: var(--primary-hover);
    }

    .image-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-top: 10px;
    }

    .image-item {
        cursor: pointer;
        border-radius: 4px;
        overflow: hidden;
        transition: transform 0.2s;
    }

    .image-item:hover {
        transform: scale(1.05);
    }

    .image-item img {
        width: 100%;
        height: 100px;
        object-fit: cover;
    }
`;

// Add styles to the document
const styleSheet = document.createElement('style')
styleSheet.textContent = styles + additionalStyles
document.head.appendChild(styleSheet)

async function suggestImages() {
    const customQuery = document.getElementById('unsplashQuery').value.trim();
    const destination = document.getElementById('destination').value.trim();
    
    let searchQuery = customQuery || destination;
    if (!searchQuery) {
        alert('Please enter a destination or custom search term');
        return;
    }

    // Add travel-related keywords for better results
    searchQuery = searchQuery + ' travel destination landmark';

    const images = await fetchUnsplashImages(searchQuery);
    const suggestionsContainer = document.querySelector('.image-suggestions');
    
    if (images.length === 0) {
        suggestionsContainer.innerHTML = '<p>No images found. Try a different search term.</p>';
        return;
    }

    suggestionsContainer.innerHTML = `
        <div class="image-grid">
            ${images.map(image => `
                <div class="image-item" onclick="selectUnsplashImage('${image.urls.regular}')">
                    <img src="${image.urls.thumb}" alt="${image.alt_description || 'Travel destination'}">
                </div>
            `).join('')}
        </div>
    `;
}

// Make function available globally
window.suggestImages = suggestImages;
window.selectUnsplashImage = function(url) {
    document.getElementById('image_url').value = url;
    document.querySelector('.image-suggestions').innerHTML = '';
    document.getElementById('unsplashQuery').value = '';
};

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
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
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
                            <th>Trip Type</th>
                            <th>Route</th>
                            <th>Baggage</th>
                            <th>Dates</th>
                            <th>Screenshot</th>
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
                                <td>${deal.trip_type === 'roundtrip' ? 'Round Trip' : 'One Way'}</td>
                                <td>${deal.route || 'N/A'}</td>
                                <td>${deal.baggage_allowance || 'N/A'}</td>
                                <td>${deal.dates || 'N/A'}</td>
                                <td>${deal.deal_screenshot_url ? `<a href="${deal.deal_screenshot_url}" target="_blank">View</a>` : 'N/A'}</td>
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
            } else if (input.type === 'select-one') {
                // Handle select elements
                if (value && input.querySelector(`option[value="${value}"]`)) {
                    input.value = value;
                }
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
