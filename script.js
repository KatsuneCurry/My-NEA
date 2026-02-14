// Buttons makes sure they exist before adding event listeners
const RevisaidHome = document.getElementById('RevisaidHome');
if (RevisaidHome) {
    RevisaidHome.addEventListener('click', function() {
        window.location.href = '/Screens/Home Screen.html';
    });
}

const LoginScreen = document.getElementById('LoginScreen');
if (LoginScreen) {
    LoginScreen.addEventListener('click', function() {
        window.location.href = '/Screens/Login Screen.html';
    });
}

const RegisterScreen = document.getElementById('RegisterScreen');
if (RegisterScreen) {
    RegisterScreen.addEventListener('click', function() {
        window.location.href = '/Screens/Register Screen.html';
    });
}

const QuizScreen = document.getElementById('QuizScreen');
if (QuizScreen) {
    QuizScreen.addEventListener('click', function() {
        window.location.href = '/Screens/Quiz Screen.html';
    });
}

const Flashcards = document.getElementById('Flashcards');
if (Flashcards) {
    Flashcards.addEventListener('click', function() {
        window.location.href = '/Screens/Flashcards.html';
    });
}

const ClassScreen = document.getElementById('ClassScreen');
if (ClassScreen) {
    ClassScreen.addEventListener('click', function() {
        window.location.href = '/Screens/Class Screen.html';
    });
}

const AnalyticsScreen = document.getElementById('AnalyticsScreen');
if (AnalyticsScreen) {
    AnalyticsScreen.addEventListener('click', function() {
        window.location.href = '/Screens/Analytics Screen.html';
    });
}

const SettingsScreen = document.getElementById('SettingsScreen');
if (SettingsScreen) {
    SettingsScreen.addEventListener('click', function() {
        window.location.href = '/Screens/Settings Screen.html';
    });
}


//Ensure user is logged in
function ensureLoggedin() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('You must be logged in to access this page.');
        window.location.href = '/Screens/Login Screen.html';
    }
}


// Register form
const RegisterForm = document.getElementById('RegisterForm');

if (RegisterForm) {
    RegisterForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const InputUsername = document.getElementById('Registerusername').value.trim();
        const InputPassword = document.getElementById('Registerpassword').value;
        const ConfirmPassword = document.getElementById('RegisterConfirm').value;
        const InputEmail = document.getElementById('RegisterEmail').value.trim();

        // Password requirements
        const Count = InputPassword.length;
        const Capital = /[A-Z]/.test(InputPassword);                        
        const Number = /\d/.test(InputPassword);

        if (Count >= 8 && Capital && Number) {
            if (InputPassword === ConfirmPassword) {
                fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: InputUsername,
                        password: InputPassword,
                        email: InputEmail
                    })
                })
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Server error');
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.success) {
                        alert('Registration successful!');
                        window.location.href = '/Screens/Login Screen.html';
                    } else {
                        alert('Registration failed: ' + (data.message || 'Username or email already exists.'));
                    }
                })
                .catch(err => {
                    console.error('Registration error:', err);
                    alert('Registration failed: Network error. Please try again.');
                });
            } else {
                alert('Passwords do not match.');
            }
        } else {
            alert('Password must be at least 8 characters long, contain a capital letter, and a number.');
        }
    });
}



// Login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('LoginUsername').value;
        const password = document.getElementById('LoginPassword').value;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const userId = data.userId;
                localStorage.setItem('userId', userId);
                alert('Login successful!');
                window.location.href = '/Screens/Home Screen.html';
            } else {
                alert('Invalid credentials.');
            }
        });
    });
}


// Creating the flashcard
const form = document.getElementById('flashcard_form');

if (form) {
form.addEventListener('submit', (e) => {e.preventDefault();
    const question = document.getElementById('card_question').value;
    const answer = document.getElementById('card_answer').value;
    const tag = document.getElementById('card_tag').value;
    
    const userId = localStorage.getItem('userId');

    fetch('/flashcards', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({question, answer, tag, userId})
    })
    .then (res=> res.json())
    .then(data => {
        console.log("flashcard saved: ", data);
        form.reset();
        alert("flashcard created");
    })
    .catch(err => {
        console.error("Error creating flashcard:", err);
        alert("Failed to create flashcard");
    });
});
}

function getTags(tagListId = 'TagList') {
    const taglist = document.getElementById(tagListId);
    if (!taglist) return [];

    return Array.from(taglist.querySelectorAll('input[name="quiz_tags"]:checked'))
        .map(input => input.value);
}

// Loading flashcards
function load_flashcards(selectedTags) {
    const list = document.getElementById('flashcard_list');
    if (!list) return;

    if (!Array.isArray(selectedTags) || selectedTags.length === 0) {
        alert('Please select at least one tag.');
        return;
    }

    list.innerHTML = '<li>Loading flashcards...</li>';

    const userId = localStorage.getItem('userId');
    fetch(`/flashcards?userId=${encodeURIComponent(userId)}`)
        .then(res => res.json())
        .then(data => {
            if (!data || !data.success) {
                throw new Error('Failed to load flashcards');
            }

            const cards = data.flashcards.filter(card => selectedTags.includes(String(card.tag || '').trim()));

            if (cards.length === 0) {
                list.innerHTML = '<li>No flashcards found.</li>';
                return;
            }

            list.innerHTML = cards.map(card => {
                    const q = String(card?.question ?? '');
                    const a = String(card?.answer ?? '');
                    const t = String(card?.tag ?? '-');
                    return `<li>${q} | ${a} | ${t}</li>`;
                })
                .join('');
        })
        .catch(err => {
            console.error(err);
            list.innerHTML = '<li>Error loading flashcards.</li>';
        });
}

const loadcards = document.getElementById('load_flashcards');
if (loadcards) {
    loadcards.addEventListener('click', () => {
        const SelectedTags = getTags('TagList');
        load_flashcards(SelectedTags);
    });
}

//tag selection for quiz
function QuizTagSelect(tagListId = 'TagList') {
    const taglist = document.getElementById(tagListId);
    if (!taglist) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
        taglist.textContent = 'Please log in first.';
        return;
    }

    //gets tags
    fetch(`/flashcards?userId=${encodeURIComponent(userId)}`)
        .then(res => res.json())
        .then(data => {
            if (!data || !data.success) {
                throw new Error('Failed to load flashcards');
            }

            const tags = Array.from(
                new Set(
                    data.flashcards
                        .map(card => String(card.tag || '').trim())
                        .filter(tag => tag.length > 0)
                )
            );

            if (tags.length === 0) {
                taglist.textContent = 'No tags found. Add tags to flashcards first.';
                return;
            }

            taglist.innerHTML = tags
                .map(tag => {
                    const safeTag = tag.replace(/"/g, '&quot;');
                    return `
                        <label>
                            <input type="checkbox" name="quiz_tags" value="${safeTag}">
                            ${tag}
                        </label><br>
                    `;
                })
                .join('');
        })
        .catch(err => {
            console.error(err);
            taglist.textContent = 'Error loading tags.';
        });

    const confirmTagsBtn = document.getElementById('ConfirmTags');
    if (confirmTagsBtn) {
        confirmTagsBtn.addEventListener('click', () => {
            const selected = Array.from(
                document.querySelectorAll('input[name="quiz_tags"]:checked')
            ).map(input => input.value);

            if (selected.length === 0) {
                alert('Please select at least one tag.');
                return;
            }

            localStorage.setItem('quizTags', JSON.stringify(selected));
            alert('Tags saved.');
        });
    }
}

// Unhide flashcards menus
function unhideFlashcardMenus(sectionId) {
    const sections = ['CreateFlashcards', 'ViewFlashcards', 'ManageFlashcards'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {section.hidden = (id !== sectionId);
        }
    });
    if (sectionId === 'ViewFlashcards') {
        QuizTagSelect('TagList');
    }

    if (sectionId === 'ManageFlashcards') {
        QuizTagSelect('ManageTagList');
    }
}

const flashcardMenu = document.getElementById('flashcardMenu');
if (flashcardMenu) {flashcardMenu.addEventListener('click', (event) => {
    const button = event.target.closest('[data-section]');
    if (!button) return;

    if (button.dataset.section ==='create') {
        unhideFlashcardMenus('CreateFlashcards');
    } else if (button.dataset.section === 'view') {
        unhideFlashcardMenus('ViewFlashcards');
    } else if (button.dataset.section === 'manage') {
        unhideFlashcardMenus('ManageFlashcards');
    }
});
}

//delete flashcards
function manageLoadFlashcards(selectedTags) {
    const list = document.getElementById('manage_flashcard_list');
    if (!list) return;

    if (!Array.isArray(selectedTags) || selectedTags.length === 0) {
        alert('Please select at least one tag.');
        return;
    }

    list.innerHTML = '<li>Loading flashcards...</li>';
    const userId = localStorage.getItem('userId');
    fetch(`/flashcards?userId=${encodeURIComponent(userId)}`)
    .then(res => res.json())
    .then(data => {
        if (!data || !data.success) {
            throw new Error('Failed to load Flashcards');
        }

        const cards = data.flashcards.filter(card => selectedTags.includes(String(card.tag || '').trim()));
        if (cards.length === 0) {
        list.innerHTML = '<li>No flashcards found.</li>';
        return;
        }

        list.innerHTML = cards.map(card => {
            const q = String(card?.question ?? '');
            const a = String(card?.answer ?? '');
            const t = String(card?.tag ?? '-');
            return ` <li data-id="${card.id}">${q} | ${a} | ${t} <button type="button" class="delete-btn">Delete</button></li>`;
        }).join('');
    })
    .catch(err => {
        console.error(err);
        list.innerHTML = '<li>Error loading flashcards.</li>';
    });
}

const LoadFlashcardsDelete = document.getElementById('LoadManageFlashcards');
if (LoadFlashcardsDelete) {
    LoadFlashcardsDelete.addEventListener('click', () => {
        const selectedTags = getTags('ManageTagList');
        manageLoadFlashcards(selectedTags);
    });
}

const manageFlashcardList = document.getElementById('manage_flashcard_list');
if (manageFlashcardList) {
    manageFlashcardList.addEventListener('click', (e) => {
        const button = e.target.closest('.delete-btn');
        if (!button) return;

        const li = button.closest('li[data-id]');
        if (!li) return;

        const cardId = li.getAttribute('data-id');
        const userId = localStorage.getItem('userId');

        fetch(`/flashcards/${encodeURIComponent(cardId)}?userId=${encodeURIComponent(userId)}`,{method: 'DELETE'})
        .then(res => res.json())
        .then(data => {
            if (!data || !data.success) {
                alert('Failed to delete flashcard.');
                return;
            }

            li.remove();
        })
        .catch(err => {
            console.error(err);
            alert('Error deleting flashcard.');
        });
    });
}


// Flashcard Quiz display
let quizCards = [];
let quizIndex = 0;
let showingQuestion = true;

function displayQuizCard() {
    const area = document.getElementById('FlashcardArea');
    const card = document.getElementById('FlashcardFace');
    const progress = document.getElementById('QuizProgress');

    if (!area || !card || !progress) return;

    if (quizIndex >= quizCards.length) {
        card.textContent = 'No remaining flashcards';
        progress.textContent = '';
        return;
    }

    const current = quizCards[quizIndex];
    showingQuestion = true;
    card.textContent = current.question;
    progress.textContent = `Card ${quizIndex + 1} of ${quizCards.length}`;
    area.hidden = false;

}

const startQuizBtn = document.getElementById('StartQuiz');
if (startQuizBtn) {
    startQuizBtn.addEventListener('click', () => {
        const selectedTags = getTags('TagList');

        if (!Array.isArray(selectedTags) || selectedTags.length === 0) {
            alert('Please Select Tags before Starting Quiz');
            return;
        }

        localStorage.setItem('quizTags', JSON.stringify(selectedTags));

        const userId = localStorage.getItem('userId');
        fetch(`/flashcards?userId=${encodeURIComponent(userId)}`)
            .then(res => res.json())
            .then(data => {
                if (!data || !data.success) {
                    throw new Error('Failed to load flashcards');
               }

                quizCards = data.flashcards.filter(card => selectedTags.includes(String(card.tag || '').trim()));
                if (quizCards.length === 0) {
                   alert('No flashcards found for selected tags.');
                   return;
               }

               quizCards = _.shuffle(quizCards);
               quizIndex = 0;
               displayQuizCard();
           })
           .catch(err => {
               console.error(err);
            alert('Error loading flashcards.');
        });
    });
}

const flipFlashcard = document.getElementById('FlipCard');
if (flipFlashcard) {
    flipFlashcard.addEventListener('click', () => {
        if(quizIndex >= quizCards.length) return;
        const card = document.getElementById('FlashcardFace');
        const currentCard = quizCards[quizIndex];

        if (showingQuestion) {
            card.textContent = currentCard.answer;
            showingQuestion = false;
        } else {
            card.textContent = currentCard.question;
            showingQuestion = true;
        }
    });
}

//logout
function logout() {
    localStorage.clear();
    window.location.href = '/Screens/Login Screen.html';
}

const logoutButton = document.getElementById('logout');
if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}