document.addEventListener('DOMContentLoaded', () => {
    // ... (existing variable declarations) ...
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginContainer = document.getElementById('login-container');
    const signupContainer = document.getElementById('signup-container');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const signoutBtn = document.getElementById('signout-btn');
    const sidebarMenu = document.querySelector('.sidebar-menu');

    // Exam-related elements
    const createExamForm = document.getElementById('create-exam-form');
    const examList = document.getElementById('exam-list');
    const examSubjectDropdown = document.getElementById('exam-subject');
    const studentExamList = document.getElementById('student-exam-list');
    const examInterface = document.getElementById('exam-interface');
    const examTitleDisplay = document.getElementById('exam-title-display');
    const examTimer = document.getElementById('exam-timer');
    const examQuestionsContainer = document.getElementById('exam-questions-container');
    const submitExamBtn = document.getElementById('submit-exam-btn');
    const studentResultsList = document.getElementById('student-results-list');
    const submittedExamsList = document.getElementById('submitted-exams-list');
    const examScoresList = document.getElementById('exam-scores-list');
    const scoreExamFilter = document.getElementById('score-exam-filter');
    const exportScoresBtn = document.getElementById('export-scores-btn');


    // Question-related elements
    const createQuestionForm = document.getElementById('create-question-form');
    const questionList = document.getElementById('question-list');
    const questionSubjectDropdown = document.getElementById('question-subject');
    const questionTypeDropdown = document.getElementById('question-type');
    const optionsContainer = document.getElementById('options-container');
    
    // Token Generation elements
    const generateTokenForm = document.getElementById('generate-token-form');
    const tokenExamDropdown = document.getElementById('token-exam');
    const tokenStudentDropdown = document.getElementById('token-student');
    const generatedTokensList = document.getElementById('generated-tokens-list');
    
    // Admin elements
    const userList = document.getElementById('user-list');
    const editUserModal = document.getElementById('edit-user-modal');
    const editUserForm = document.getElementById('edit-user-form');
    
    // System Settings elements
    const createCourseForm = document.getElementById('create-course-form');
    const createSubjectForm = document.getElementById('create-subject-form');
    const courseList = document.getElementById('course-list');
    const subjectList = document.getElementById('subject-list');
    const subjectCourseDropdown = document.getElementById('subject-course');

    // Modal elements
    const gradeExamModal = document.getElementById('grade-exam-modal');
    const gradeExamQuestionsContainer = document.getElementById('grade-exam-questions-container');
    const finishGradingBtn = document.getElementById('finish-grading-btn');
    const editExamModal = document.getElementById('edit-exam-modal');
    const editExamForm = document.getElementById('edit-exam-form');
    const editQuestionModal = document.getElementById('edit-question-modal');
    const editQuestionForm = document.getElementById('edit-question-form');
    const confirmationModal = document.getElementById('confirmation-modal');
    const manageExamQuestionsModal = document.getElementById('manage-exam-questions-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    const confirmNoBtn = document.getElementById('confirm-no-btn');
    const availableQuestionsList = document.getElementById('available-questions-list');
    const examQuestionsList = document.getElementById('exam-questions-list');


    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const signupPassword = document.getElementById('signup-password');
    const repeatPassword = document.getElementById('signup-repeat-password');
    const strengthIndicator = document.getElementById('password-strength-indicator');
    const notification = document.getElementById('notification');
    
    let currentExamId = null; // To store the ID of the exam being managed
    let currentAttemptId = null; // To store the ID of the exam attempt being graded
    let examTimerInterval = null;

    // --- Custom Notification Function ---
    const showNotification = (message, isSuccess) => {
        notification.textContent = message;
        notification.className = 'notification-bar'; // Reset classes
        if (isSuccess) {
            notification.classList.add('notification-success');
        } else {
            notification.classList.add('notification-error');
        }
        notification.classList.add('show');

        // Hide the notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };
    
    // --- Custom Confirmation Modal Logic ---
    let confirmCallback = null;
    const showConfirmation = (title, message, callback) => {
        document.getElementById('confirmation-title').textContent = title;
        document.getElementById('confirmation-message').textContent = message;
        confirmationModal.style.display = 'flex';
        confirmCallback = callback;
    };
    
    if(confirmYesBtn) {
        confirmYesBtn.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback();
            }
            confirmationModal.style.display = 'none';
        });
    }
    
    if(confirmNoBtn) {
        confirmNoBtn.addEventListener('click', () => {
            confirmationModal.style.display = 'none';
        });
    }

    // --- UI Update Functions ---
    const setupDashboardUI = (role) => {
        authContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        document.body.style.justifyContent = 'flex-start';
        document.body.style.alignItems = 'flex-start';

        const navLinks = {
            student: [
                { text: 'Dashboard', section: 'student-dashboard' },
                { text: 'My Exams', section: 'student-my-exams' },
                { text: 'Results', section: 'student-results' }
            ],
            examiner: [
                { text: 'Dashboard', section: 'examiner-dashboard' },
                { text: 'Manage Exams', section: 'examiner-manage-exams' },
                { text: 'Question Bank', section: 'examiner-question-bank' },
                { text: 'Grade Exams', section: 'examiner-grade-exams' },
                { text: 'Exam Scores', section: 'examiner-exam-scores' }
            ],
            admin: [
                { text: 'Dashboard', section: 'admin-dashboard' },
                { text: 'Manage Users', section: 'admin-manage-users' },
                { text: 'System Settings', section: 'admin-settings' }
            ]
        };

        sidebarMenu.innerHTML = '';
        const userLinks = navLinks[role] || [];
        userLinks.forEach(link => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" data-section="${link.section}">${link.text}</a>`;
            sidebarMenu.appendChild(li);
        });

        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });

        const dashboard = document.getElementById(`${role}-dashboard`);
        if (dashboard) {
            dashboard.style.display = 'block';
        }
        
        // Pre-fetch data for forms
        if (role === 'examiner') {
            fetchAndPopulateExamsForTokenDropdown();
            fetchAndPopulateStudents();
            fetchAndDisplayGeneratedTokens();
        }
        if (role === 'admin') {
            fetchAndDisplayUsers();
        }
    };

    const showLoginScreen = () => {
        appContainer.style.display = 'none';
        authContainer.style.display = 'block';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
    };

    // --- Event Listeners ---
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            loginContainer.style.display = 'none';
            signupContainer.style.display = 'block';
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signupContainer.style.display = 'none';
            loginContainer.style.display = 'block';
        });
    }

    sidebarMenu.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target;
        if (target.tagName === 'A' && target.dataset.section) {
            const sectionId = target.dataset.section;
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.style.display = 'none';
            });
            const sectionToShow = document.getElementById(sectionId);
            if (sectionToShow) {
                sectionToShow.style.display = 'block';
            }
            if (sectionId === 'examiner-manage-exams') {
                fetchAndDisplayExams();
                fetchAndPopulateSubjects(examSubjectDropdown);
            }
            if (sectionId === 'examiner-question-bank') {
                fetchAndDisplayQuestions();
                fetchAndPopulateSubjects(questionSubjectDropdown);
                // Render the default options for the initially selected question type
                if (questionTypeDropdown) {
                    questionTypeDropdown.dispatchEvent(new Event('change'));
                }
            }
            if (sectionId === 'student-my-exams') {
                fetchAndDisplayStudentExams();
            }
            if (sectionId === 'admin-manage-users') {
                fetchAndDisplayUsers();
            }
            if (sectionId === 'admin-settings') {
                fetchAndDisplayCourses();
                fetchAndDisplaySubjects();
                fetchAndPopulateCoursesForSubjectDropdown();
            }
            if (sectionId === 'examiner-grade-exams') {
                fetchAndDisplaySubmittedExams();
            }
            if (sectionId === 'examiner-exam-scores') {
                fetchAndDisplayExamScores();
                fetchAndPopulateExamsForScoreFilter();
            }
            if (sectionId === 'student-results') {
                fetchAndDisplayStudentResults();
            }
        }
    });
    
    // --- Question Bank Specific Logic ---
    const renderMcqOptions = () => {
        optionsContainer.innerHTML = `
            <label>Options</label>
            <div class="option-group">
                <input type="radio" name="correct_option" value="0" checked>
                <input type="text" name="options[]" placeholder="Option 1" required>
            </div>
            <div class="option-group">
                <input type="radio" name="correct_option" value="1">
                <input type="text" name="options[]" placeholder="Option 2" required>
            </div>
            <button type="button" id="add-option-btn" class="btn-secondary">Add Another Option</button>
        `;
    };
    
    const renderTrueFalseOptions = () => {
        optionsContainer.innerHTML = `
            <label>Correct Answer</label>
            <div class="option-group">
                <input type="radio" name="correct_tf_option" value="True" checked> True
            </div>
            <div class="option-group">
                <input type="radio" name="correct_tf_option" value="False"> False
            </div>
        `;
    };

    const renderFillBlankOptions = () => {
        optionsContainer.innerHTML = `
            <label>Correct Answer</label>
            <div class="form-group">
                <input type="text" name="fill_blank_answer" placeholder="Enter the exact answer" required>
            </div>
        `;
    };

    if (questionTypeDropdown) {
        questionTypeDropdown.addEventListener('change', () => {
            const questionType = questionTypeDropdown.value;
            if (questionType === 'mcq') {
                renderMcqOptions();
            } else if (questionType === 'true_false') {
                renderTrueFalseOptions();
            } else if (questionType === 'fill_blank') {
                renderFillBlankOptions();
            } else {
                optionsContainer.innerHTML = '';
            }
        });
    }
    
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'add-option-btn') {
            const optionCount = optionsContainer.querySelectorAll('.option-group').length;
            const newOption = document.createElement('div');
            newOption.className = 'option-group';
            newOption.innerHTML = `
                <input type="radio" name="correct_option" value="${optionCount}">
                <input type="text" name="options[]" placeholder="Option ${optionCount + 1}" required>
            `;
            e.target.before(newOption);
        }
    });

    // --- Password Strength Checker ---
    const checkPasswordStrength = (password) => {
        let score = 0;
        if (password.length > 8) score++;
        if (password.match(/[a-z]/)) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^a-zA-Z0-9]/)) score++;
        const strengthMap = [
            { text: 'Weak', className: 'strength-weak' },
            { text: 'Weak', className: 'strength-weak' },
            { text: 'Weak', className: 'strength-weak' },
            { text: 'Medium', className: 'strength-medium' },
            { text: 'Strong', className: 'strength-strong' },
            { text: 'Strong', className: 'strength-strong' }
        ];
        return strengthMap[score] || { text: '', className: '' };
    };

    if (signupPassword) {
        signupPassword.addEventListener('input', () => {
            const password = signupPassword.value;
            const strength = checkPasswordStrength(password);
            strengthIndicator.textContent = password ? `Strength: ${strength.text}` : '';
            strengthIndicator.className = strength.className;
        });
    }

    // --- Form Submission and Auth Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            try {
                const response = await fetch('api/signin.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification('Login successful!', true);
                    await checkAuthState();
                } else {
                    showNotification(`Login failed: ${result.message || 'Invalid credentials.'}`, false);
                }
            } catch (error) {
                console.error('Error during login:', error);
                showNotification('An error occurred. Please try again.', false);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (signupPassword.value !== repeatPassword.value) {
                showNotification("Passwords do not match.", false);
                return;
            }
            const formData = new FormData(signupForm);
            try {
                const response = await fetch('api/signup.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification('Sign up successful! Please log in.', true);
                    signupContainer.style.display = 'none';
                    loginContainer.style.display = 'block';
                } else {
                    showNotification(`Sign up failed: ${result.message}`, false);
                }
            } catch (error) {
                console.error('Error during signup:', error);
                showNotification('An error occurred. Please try again.', false);
            }
        });
    }
    
    if (createExamForm) {
        createExamForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(createExamForm);
            try {
                const response = await fetch('api/create_exam.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification('Exam created successfully!', true);
                    createExamForm.reset();
                    fetchAndDisplayExams();
                } else {
                    showNotification(`Error: ${result.message}`, false);
                }
            } catch (error) {
                console.error('Error creating exam:', error);
                showNotification('An error occurred. Please try again.', false);
            }
        });
    }

    if (createQuestionForm) {
        createQuestionForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(createQuestionForm);
            const data = Object.fromEntries(formData);
            const questionType = data.question_type;
            data.options = []; // Initialize options array

            if (questionType === 'mcq') {
                const options = Array.from(document.querySelectorAll('input[name="options[]"]')).map(input => input.value);
                const checkedRadio = document.querySelector('input[name="correct_option"]:checked');
                if (!checkedRadio) {
                    showNotification('Please select a correct answer for the multiple-choice question.', false);
                    return;
                }
                const correctOptionIndex = checkedRadio.value;
                data.options = options.map((option, index) => ({
                    option_text: option,
                    is_correct: index == correctOptionIndex
                }));
            } else if (questionType === 'true_false') {
                const checkedRadio = document.querySelector('input[name="correct_tf_option"]:checked');
                if (!checkedRadio) {
                    showNotification('Please select a correct answer for the true/false question.', false);
                    return;
                }
                const correctAnswer = checkedRadio.value;
                data.options.push({ option_text: 'True', is_correct: correctAnswer === 'True' });
                data.options.push({ option_text: 'False', is_correct: correctAnswer === 'False' });
            } else if (questionType === 'fill_blank') {
                const correctAnswer = document.querySelector('input[name="fill_blank_answer"]').value;
                if (correctAnswer) {
                    data.options.push({ option_text: correctAnswer, is_correct: true });
                } else {
                    showNotification('Please provide the correct answer for the fill in the blank question.', false);
                    return;
                }
            }

            try {
                const response = await fetch('api/create_question.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification('Question added successfully!', true);
                    createQuestionForm.reset();
                    optionsContainer.innerHTML = '';
                    fetchAndDisplayQuestions();
                } else {
                    showNotification(`Error: ${result.message}`, false);
                }
            } catch (error) {
                console.error('Error creating question:', error);
                showNotification('An error occurred. Please try again.', false);
            }
        });
    }
    
    if (generateTokenForm) {
        generateTokenForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(generateTokenForm);
            const data = Object.fromEntries(formData);
            try {
                const response = await fetch('api/generate_token.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification(`Token generated: ${result.token}`, true);
                    generateTokenForm.reset();
                    fetchAndDisplayGeneratedTokens(); // Refresh the list
                } else {
                    showNotification(`Error: ${result.message}`, false);
                }
            } catch (error) {
                console.error('Error generating token:', error);
                showNotification('An error occurred. Please try again.', false);
            }
        });
    }

    if (signoutBtn) {
        signoutBtn.addEventListener('click', async () => {
            await fetch('api/signout.php');
            showNotification('You have been signed out.', true);
            showLoginScreen();
        });
    }

    // --- Data Fetching ---
    const fetchAndDisplayExams = async () => {
        try {
            const response = await fetch('api/get_exams.php');
            const exams = await response.json();
            examList.innerHTML = '';
            if (exams.length > 0) {
                exams.forEach(exam => {
                    const examElement = document.createElement('div');
                    examElement.className = 'exam-item';
                    examElement.innerHTML = `
                        <div>
                            <h4>${exam.title}</h4>
                            <p>${exam.description}</p>
                            <div class="exam-meta">
                                <span>Marks: ${exam.total_marks}</span>
                                <span>Time: ${exam.time_limit} mins</span>
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="edit-exam-btn" data-exam-id="${exam.exam_id}">Edit</button>
                            <button class="manage-questions-btn" data-exam-id="${exam.exam_id}" data-exam-title="${exam.title}">Manage Questions</button>
                            <button class="delete-exam-btn" data-exam-id="${exam.exam_id}">Delete</button>
                        </div>
                    `;
                    examList.appendChild(examElement);
                });
            } else {
                examList.innerHTML = '<p>No exams found.</p>';
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
        }
    };
    
    const fetchAndDisplayGeneratedTokens = async () => {
        try {
            const response = await fetch('api/get_generated_tokens.php');
            const tokens = await response.json();
            generatedTokensList.innerHTML = '';
            if (tokens.length > 0) {
                tokens.forEach(token => {
                    const tokenElement = document.createElement('div');
                    tokenElement.className = 'exam-item';
                    tokenElement.innerHTML = `
                        <div>
                            <h4>Token: ${token.token}</h4>
                            <div class="exam-meta">
                                <span>Exam: ${token.exam_title}</span>
                                <span>Student: ${token.student_name}</span>
                            </div>
                        </div>
                    `;
                    generatedTokensList.appendChild(tokenElement);
                });
            } else {
                generatedTokensList.innerHTML = '<p>No tokens generated yet.</p>';
            }
        } catch (error) {
            console.error('Error fetching tokens:', error);
        }
    };
    
    const fetchAndPopulateExamsForTokenDropdown = async () => {
        try {
            const response = await fetch('api/get_exams.php');
            const exams = await response.json();
            tokenExamDropdown.innerHTML = '<option value="">Select an Exam</option>';
            if (exams.length > 0) {
                exams.forEach(exam => {
                    const option = document.createElement('option');
                    option.value = exam.exam_id;
                    option.textContent = exam.title;
                    tokenExamDropdown.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error fetching exams for token:', error);
        }
    };
    
    const fetchAndPopulateStudents = async () => {
        try {
            const response = await fetch('api/get_students.php');
            const students = await response.json();
            tokenStudentDropdown.innerHTML = '<option value="">Select a Student</option>';
            if (students.length > 0) {
                students.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.username} (${student.email})`;
                    tokenStudentDropdown.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchAndDisplayStudentExams = async () => {
        try {
            const response = await fetch('api/get_student_exams.php');
            const exams = await response.json();
            studentExamList.innerHTML = '';
            if (exams.length > 0) {
                exams.forEach(exam => {
                    const examElement = document.createElement('div');
                    examElement.className = 'exam-item';
                    examElement.innerHTML = `
                        <div>
                            <h4>${exam.title} (${exam.subject_name})</h4>
                            <p>${exam.description}</p>
                            <div class="exam-meta">
                                <span>Marks: ${exam.total_marks}</span>
                                <span>Time: ${exam.time_limit} mins</span>
                            </div>
                        </div>
                        <div class="item-actions">
                             <input type="text" class="token-input" placeholder="Enter Exam Token" data-exam-id="${exam.exam_id}">
                            <button class="start-exam-btn" data-exam-id="${exam.exam_id}">Start Exam</button>
                        </div>
                    `;
                    studentExamList.appendChild(examElement);
                });
            } else {
                studentExamList.innerHTML = '<p>No exams assigned to you yet.</p>';
            }
        } catch (error) {
            console.error('Error fetching student exams:', error);
        }
    };
    
    const fetchAndDisplayStudentResults = async () => {
        try {
            const response = await fetch('api/get_student_results.php');
            const results = await response.json();
            const studentResultsList = document.getElementById('student-results-list');
            studentResultsList.innerHTML = '';
            if (results.length > 0) {
                results.forEach(result => {
                    const resultElement = document.createElement('div');
                    resultElement.className = 'exam-item';
                    resultElement.innerHTML = `
                        <div>
                            <h4>${result.exam_title}</h4>
                            <div class="exam-meta">
                                <span>Subject: ${result.subject_name}</span>
                                <span>Score: ${result.score}</span>
                                <span>Completed: ${new Date(result.end_time).toLocaleString()}</span>
                            </div>
                        </div>
                    `;
                    studentResultsList.appendChild(resultElement);
                });
            } else {
                studentResultsList.innerHTML = '<p>No results found.</p>';
            }
        } catch (error) {
            console.error('Error fetching student results:', error);
        }
    };

    const fetchAndDisplayQuestions = async () => {
        try {
            const response = await fetch('api/get_questions.php');
            const questions = await response.json();
            questionList.innerHTML = '';
            if (questions.length > 0) {
                questions.forEach(q => {
                    const qElement = document.createElement('div');
                    qElement.className = 'question-item';
                    qElement.innerHTML = `
                        <div>
                            <h4>${q.question_text}</h4>
                            <div class="question-meta">
                                <span>Subject: ${q.subject_name}</span>
                                <span>Type: ${q.question_type}</span>
                                <span>Marks: ${q.marks}</span>
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="edit-btn" data-id="${q.question_id}" data-text="${q.question_text}" data-marks="${q.marks}">Edit</button>
                            <button class="delete-btn" data-id="${q.question_id}">Delete</button>
                        </div>
                    `;
                    questionList.appendChild(qElement);
                });
            } else {
                questionList.innerHTML = '<p>No questions found.</p>';
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };
    
    const fetchAndDisplayUsers = async () => {
        try {
            const response = await fetch('api/get_users.php');
            const users = await response.json();
            userList.innerHTML = '';
            if (users.length > 0) {
                users.forEach(user => {
                    const userElement = document.createElement('div');
                    userElement.className = 'exam-item'; // Re-using styles
                    userElement.innerHTML = `
                        <div>
                            <h4>${user.username} (${user.email})</h4>
                            <div class="exam-meta">
                                <span>Role: ${user.role}</span>
                                <span>Status: ${user.status}</span>
                                <span>Joined: ${new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                         <div class="item-actions">
                            <button class="edit-user-btn" data-id="${user.id}" data-username="${user.username}" data-email="${user.email}" data-role="${user.role}">Edit</button>
                            <button class="deactivate-user-btn" data-id="${user.id}" data-status="${user.status}">${user.status === 'active' ? 'Ban' : 'Unban'}</button>
                            <button class="delete-user-btn" data-id="${user.id}">Delete</button>
                        </div>
                    `;
                    userList.appendChild(userElement);
                });
            } else {
                userList.innerHTML = '<p>No users found.</p>';
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    
    const fetchAndDisplaySubmittedExams = async () => {
        try {
            const response = await fetch('api/get_submitted_exams.php');
            const attempts = await response.json();
            submittedExamsList.innerHTML = '';
            if (attempts.length > 0) {
                attempts.forEach(attempt => {
                    const attemptElement = document.createElement('div');
                    attemptElement.className = 'exam-item';
                    attemptElement.innerHTML = `
                        <div>
                            <h4>${attempt.exam_title}</h4>
                            <div class="exam-meta">
                                <span>Student: ${attempt.student_name}</span>
                                <span>Submitted: ${new Date(attempt.end_time).toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="grade-exam-btn" data-attempt-id="${attempt.attempt_id}">Grade</button>
                        </div>
                    `;
                    submittedExamsList.appendChild(attemptElement);
                });
            } else {
                submittedExamsList.innerHTML = '<p>No exams to grade.</p>';
            }
        } catch (error) {
            console.error('Error fetching submitted exams:', error);
        }
    };

    const fetchAndDisplayExamScores = async (examId = '') => {
        try {
            const response = await fetch(`api/get_exam_scores.php?exam_id=${examId}`);
            const scores = await response.json();
            examScoresList.innerHTML = '';
            if (scores.length > 0) {
                scores.forEach(score => {
                    const scoreElement = document.createElement('div');
                    scoreElement.className = 'exam-item';
                    scoreElement.innerHTML = `
                        <div>
                            <h4>${score.exam_title}</h4>
                            <div class="exam-meta">
                                <span>Student: ${score.student_name}</span>
                                <span>Score: ${score.score} / ${score.total_marks}</span>
                                <span>Graded on: ${new Date(score.end_time).toLocaleString()}</span>
                            </div>
                        </div>
                    `;
                    examScoresList.appendChild(scoreElement);
                });
            } else {
                examScoresList.innerHTML = '<p>No scores found.</p>';
            }
        } catch (error) {
            console.error('Error fetching exam scores:', error);
        }
    };

    const fetchAndPopulateExamsForScoreFilter = async () => {
        try {
            const response = await fetch('api/get_exams.php');
            const exams = await response.json();
            scoreExamFilter.innerHTML = '<option value="">Filter by Exam</option>';
            if (exams.length > 0) {
                exams.forEach(exam => {
                    const option = document.createElement('option');
                    option.value = exam.exam_id;
                    option.textContent = exam.title;
                    scoreExamFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error fetching exams for filter:', error);
        }
    };

    const fetchAndPopulateSubjects = async (dropdownElement) => {
        if (!dropdownElement) return;
        try {
            const response = await fetch('api/get_subjects.php');
            const subjects = await response.json();
            dropdownElement.innerHTML = '<option value="">Select a Subject</option>';
            if (subjects.length > 0) {
                subjects.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject.subject_id;
                    option.textContent = subject.name;
                    dropdownElement.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchAndDisplayCourses = async () => {
        try {
            const response = await fetch('api/get_courses.php');
            const courses = await response.json();
            courseList.innerHTML = '';
            if (courses.length > 0) {
                courses.forEach(course => {
                    const courseElement = document.createElement('div');
                    courseElement.className = 'exam-item';
                    courseElement.innerHTML = `
                        <div>
                            <h4>${course.name}</h4>
                            <p>${course.description}</p>
                        </div>
                        <div class="item-actions">
                            <button class="delete-course-btn" data-id="${course.course_id}">Delete</button>
                        </div>
                    `;
                    courseList.appendChild(courseElement);
                });
            } else {
                courseList.innerHTML = '<p>No courses found.</p>';
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchAndDisplaySubjects = async () => {
        try {
            const response = await fetch('api/get_subjects.php');
            const subjects = await response.json();
            subjectList.innerHTML = '';
            if (subjects.length > 0) {
                subjects.forEach(subject => {
                    const subjectElement = document.createElement('div');
                    subjectElement.className = 'exam-item';
                    subjectElement.innerHTML = `
                        <div>
                            <h4>${subject.name}</h4>
                            <div class="exam-meta">
                                <span>Course: ${subject.course_name}</span>
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="delete-subject-btn" data-id="${subject.subject_id}">Delete</button>
                        </div>
                    `;
                    subjectList.appendChild(subjectElement);
                });
            } else {
                subjectList.innerHTML = '<p>No subjects found.</p>';
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchAndPopulateCoursesForSubjectDropdown = async () => {
        try {
            const response = await fetch('api/get_courses.php');
            const courses = await response.json();
            subjectCourseDropdown.innerHTML = '<option value="">Select a Course</option>';
            if (courses.length > 0) {
                courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course.course_id;
                    option.textContent = course.name;
                    subjectCourseDropdown.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error fetching courses for dropdown:', error);
        }
    };
    
    // --- Edit/Delete Question Logic ---
    questionList.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('delete-btn')) {
            const questionId = target.dataset.id;
            showConfirmation('Delete Question', 'Are you sure you want to delete this question?', async () => {
                try {
                    const response = await fetch('api/delete_question.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question_id: questionId })
                    });
                    const result = await response.json();
                    if (response.ok && result.success) {
                        showNotification('Question deleted successfully!', true);
                        fetchAndDisplayQuestions();
                    } else {
                        showNotification(`Error: ${result.message}`, false);
                    }
                } catch (error) {
                    console.error('Error deleting question:', error);
                    showNotification('An error occurred.', false);
                }
            });
        }
        
        if (target.classList.contains('edit-btn')) {
            document.getElementById('edit-question-id').value = target.dataset.id;
            document.getElementById('edit-question-text').value = target.dataset.text;
            document.getElementById('edit-question-marks').value = target.dataset.marks;
            editQuestionModal.style.display = 'flex';
        }
    });
    
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modalId;
            document.getElementById(modalId).style.display = 'none';
        });
    });
    
    if(editQuestionForm) {
        editQuestionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editQuestionForm);
            const data = Object.fromEntries(formData);
            try {
                const response = await fetch('api/update_question.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification('Question updated successfully!', true);
                    editQuestionModal.style.display = 'none';
                    fetchAndDisplayQuestions();
                } else {
                    showNotification(`Error: ${result.message}`, false);
                }
            } catch (error) {
                console.error('Error updating question:', error);
                showNotification('An error occurred.', false);
            }
        });
    }
    
    // --- Manage Exam Questions Logic ---
    examList.addEventListener('click', async (e) => {
        const target = e.target;

        if (target.classList.contains('edit-exam-btn')) {
            const examId = target.dataset.examId;
            // Fetch the exam details to populate the modal
            try {
                const response = await fetch(`api/get_exam.php?exam_id=${examId}`);
                const exam = await response.json();
                if (response.ok) {
                    document.getElementById('edit-exam-id').value = exam.exam_id;
                    document.getElementById('edit-exam-title').value = exam.title;
                    document.getElementById('edit-exam-description').value = exam.description;
                    document.getElementById('edit-exam-marks').value = exam.total_marks;
                    document.getElementById('edit-exam-limit').value = exam.time_limit;
                    
                    // Populate and set the correct subject
                    const subjectDropdown = document.getElementById('edit-exam-subject');
                    await fetchAndPopulateSubjects(subjectDropdown);
                    subjectDropdown.value = exam.subject_id;

                    editExamModal.style.display = 'flex';
                } else {
                    showNotification(`Error: ${exam.message}`, false);
                }
            } catch (error) {
                console.error('Error fetching exam details:', error);
                showNotification('An error occurred.', false);
            }
        }

        if (target.classList.contains('manage-questions-btn')) {
            currentExamId = target.dataset.examId;
            const examTitle = target.dataset.examTitle;
            document.getElementById('manage-questions-title').textContent = `Manage Questions for "${examTitle}"`;
            fetchExamAndAvailableQuestions(currentExamId);
            manageExamQuestionsModal.style.display = 'flex';
        }

        if (target.classList.contains('delete-exam-btn')) {
            const examId = target.dataset.examId;
            showConfirmation('Delete Exam', 'Are you sure you want to delete this exam?', async () => {
                try {
                    const response = await fetch('api/delete_exam.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ exam_id: examId })
                    });
                    const result = await response.json();
                    if (response.ok && result.success) {
                        showNotification('Exam deleted successfully!', true);
                        fetchAndDisplayExams();
                    } else {
                        showNotification(`Error: ${result.message}`, false);
                    }
                } catch (error) {
                    console.error('Error deleting exam:', error);
                    showNotification('An error occurred.', false);
                }
            });
        }
    });

    if (editExamForm) {
        editExamForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editExamForm);
            const data = Object.fromEntries(formData);
            try {
                const response = await fetch('api/update_exam.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification('Exam updated successfully!', true);
                    editExamModal.style.display = 'none';
                    fetchAndDisplayExams();
                } else {
                    showNotification(`Error: ${result.message}`, false);
                }
            } catch (error) {
                console.error('Error updating exam:', error);
                showNotification('An error occurred.', false);
            }
        });
    }

    const fetchExamAndAvailableQuestions = async (examId) => {
        try {
            const response = await fetch(`api/get_exam_questions.php?exam_id=${examId}`);
            const data = await response.json();

            availableQuestionsList.innerHTML = '';
            data.available.forEach(q => {
                const item = document.createElement('div');
                item.className = 'question-item';
                item.innerHTML = `<span>${q.question_text}</span><button class="add-question-to-exam-btn" data-question-id="${q.question_id}">Add</button>`;
                availableQuestionsList.appendChild(item);
            });

            examQuestionsList.innerHTML = '';
            data.in_exam.forEach(q => {
                const item = document.createElement('div');
                item.className = 'question-item';
                item.innerHTML = `<span>${q.question_text}</span><button class="remove-question-from-exam-btn" data-question-id="${q.question_id}">Remove</button>`;
                examQuestionsList.appendChild(item);
            });
        } catch (error) {
            console.error('Error fetching exam questions:', error);
        }
    };
    
    // Add/Remove questions from exam
    document.addEventListener('click', async (e) => {
        const target = e.target;
        let questionId = null;
        let phpFile = '';

        if (target.classList.contains('add-question-to-exam-btn')) {
            questionId = target.dataset.questionId;
            phpFile = 'add_question_to_exam.php';
        } else if (target.classList.contains('remove-question-from-exam-btn')) {
            questionId = target.dataset.questionId;
            phpFile = 'remove_question_from_exam.php';
        }

        if (phpFile && currentExamId && questionId) {
            try {
                const response = await fetch(`api/${phpFile}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ exam_id: currentExamId, question_id: questionId })
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification(result.message, true);
                    fetchExamAndAvailableQuestions(currentExamId); // Refresh the lists
                } else {
                    showNotification(`Error: ${result.message}`, false);
                }
            } catch (error) {
                console.error(`Error with ${phpFile}:`, error);
                showNotification('An error occurred.', false);
            }
        }
    });
    
    // --- Student Exam Logic ---
    studentExamList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('start-exam-btn')) {
            const examId = e.target.dataset.examId;
            const tokenInput = document.querySelector(`.token-input[data-exam-id="${examId}"]`);
            const token = tokenInput.value;

            if (!token) {
                showNotification('Please enter an exam token.', false);
                return;
            }

            try {
                const response = await fetch('api/start_exam.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ exam_id: examId, token: token })
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification('Exam started!', true);
                    startExam(examId);
                } else {
                    showNotification(`Error: ${result.message}`, false);
                }
            } catch (error) {
                console.error('Error starting exam:', error);
                showNotification('An error occurred.', false);
            }
        }
    });
    
    const startExam = async (examId) => {
        currentExamId = examId; // Store the current exam ID
        try {
            const response = await fetch(`api/get_exam_for_student.php?exam_id=${examId}`);
            const data = await response.json();
            
            // Hide other sections and show the exam interface
            document.querySelectorAll('.dashboard-section').forEach(s => s.style.display = 'none');
            examInterface.style.display = 'block';
            
            examTitleDisplay.textContent = data.exam.title;
            
            // Render questions
            examQuestionsContainer.innerHTML = '';
            data.questions.forEach((q, index) => {
                const questionElement = document.createElement('div');
                questionElement.className = 'exam-question';
                questionElement.dataset.questionId = q.question_id;
                questionElement.dataset.questionType = q.question_type;
                
                let answerHtml = '';
                
                switch (q.question_type) {
                    case 'mcq':
                        answerHtml = '<div class="options">';
                        q.options.forEach(opt => {
                            answerHtml += `
                                <label>
                                    <input type="radio" name="question_${q.question_id}" value="${opt.option_id}">
                                    ${opt.option_text}
                                </label>
                            `;
                        });
                        answerHtml += '</div>';
                        break;
                    case 'true_false':
                        answerHtml = '<div class="options">';
                        if (q.options && q.options.length > 0) {
                            const trueOption = q.options.find(o => o.option_text.toLowerCase() === 'true');
                            const falseOption = q.options.find(o => o.option_text.toLowerCase() === 'false');
                            if (trueOption) {
                                answerHtml += `<label><input type="radio" name="question_${q.question_id}" value="${trueOption.option_id}"> True</label>`;
                            }
                             if (falseOption) {
                                answerHtml += `<label><input type="radio" name="question_${q.question_id}" value="${falseOption.option_id}"> False</label>`;
                            }
                        }
                        answerHtml += '</div>';
                        break;
                    case 'fill_blank':
                        answerHtml = `<input type="text" name="question_${q.question_id}" class="fill-blank-input">`;
                        break;
                    case 'subjective':
                        answerHtml = `<textarea name="question_${q.question_id}" class="subjective-textarea" rows="4"></textarea>`;
                        break;
                }
                
                questionElement.innerHTML = `
                    <h4>${index + 1}. ${q.question_text}</h4>
                    ${answerHtml}
                `;
                examQuestionsContainer.appendChild(questionElement);
            });
            
            // Start timer
            let timeRemaining = data.exam.time_limit * 60;
            examTimerInterval = setInterval(() => {
                const minutes = Math.floor(timeRemaining / 60);
                let seconds = timeRemaining % 60;
                seconds = seconds < 10 ? '0' + seconds : seconds;
                examTimer.textContent = `${minutes}:${seconds}`;
                timeRemaining--;
                if (timeRemaining < 0) {
                    clearInterval(examTimerInterval);
                    submitExam();
                }
            }, 1000);

        } catch (error) {
            console.error('Error loading exam:', error);
            showNotification('Could not load the exam.', false);
        }
    };
    
    const submitExam = async () => {
        clearInterval(examTimerInterval);
        const answers = [];
        document.querySelectorAll('.exam-question').forEach(q => {
            const questionId = q.dataset.questionId;
            const questionType = q.dataset.questionType;
            let answerData = { question_id: questionId, option_id: null, answer_text: null };

            if (questionType === 'mcq' || questionType === 'true_false') {
                const selectedOption = q.querySelector('input[type="radio"]:checked');
                if (selectedOption) {
                    answerData.option_id = selectedOption.value;
                }
            } else { // subjective or fill_blank
                const input = q.querySelector('textarea, input[type="text"]');
                if (input) {
                    answerData.answer_text = input.value;
                }
            }
            answers.push(answerData);
        });

        try {
            const response = await fetch('api/submit_exam.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exam_id: currentExamId, answers: answers })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                showNotification(`Exam submitted! Your score: ${result.score}`, true);
                examInterface.style.display = 'none';
                document.getElementById('student-my-exams').style.display = 'block';
                fetchAndDisplayStudentExams();
            } else {
                showNotification(`Error: ${result.message}`, false);
            }
        } catch (error) {
            console.error('Error submitting exam:', error);
            showNotification('An error occurred.', false);
        }
    };
    
    if (submitExamBtn) {
        submitExamBtn.addEventListener('click', submitExam);
    }
    
    // --- Admin User Management Logic ---
    userList.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('delete-user-btn')) {
            const userId = target.dataset.id;
            showConfirmation('Delete User', 'Are you sure you want to delete this user?', async () => {
                try {
                    const response = await fetch('api/delete_user.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: userId })
                    });
                    const result = await response.json();
                    if (response.ok && result.success) {
                        showNotification('User deleted successfully!', true);
                        fetchAndDisplayUsers();
                    } else {
                        showNotification(`Error: ${result.message}`, false);
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    showNotification('An error occurred.', false);
                }
            });
        }
        
        if (target.classList.contains('deactivate-user-btn')) {
            const userId = target.dataset.id;
            const currentStatus = target.dataset.status;
            const newStatus = currentStatus === 'active' ? 'banned' : 'active';
            const action = newStatus === 'active' ? 'Unban' : 'Ban';

            showConfirmation(`${action} User`, `Are you sure you want to ${action.toLowerCase()} this user?`, async () => {
                try {
                    const response = await fetch('api/deactivate_user.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: userId, status: newStatus })
                    });
                    const result = await response.json();
                    if (response.ok && result.success) {
                        showNotification(`User ${action.toLowerCase()}ned successfully!`, true);
                        fetchAndDisplayUsers();
                    } else {
                        showNotification(`Error: ${result.message}`, false);
                    }
                } catch (error) {
                    console.error(`Error ${action.toLowerCase()}ing user:`, error);
                    showNotification('An error occurred.', false);
                }
            });
        }
        
        if (target.classList.contains('edit-user-btn')) {
            document.getElementById('edit-user-id').value = target.dataset.id;
            document.getElementById('edit-username').value = target.dataset.username;
            document.getElementById('edit-email').value = target.dataset.email;
            document.getElementById('edit-role').value = target.dataset.role;
            editUserModal.style.display = 'flex';
        }
    });
    
    if(editUserForm) {
        editUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editUserForm);
            const data = Object.fromEntries(formData);
            try {
                const response = await fetch('api/update_user.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification('User updated successfully!', true);
                    editUserModal.style.display = 'none';
                    fetchAndDisplayUsers();
                } else {
                    showNotification(`Error: ${result.message}`, false);
                }
            } catch (error) {
                console.error('Error updating user:', error);
                showNotification('An error occurred.', false);
            }
        });
    }

    if (createCourseForm) {
        createCourseForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(createCourseForm);
            const data = Object.fromEntries(formData);
            try {
                const response = await fetch('api/create_course.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification('Course added successfully!', true);
                    createCourseForm.reset();
                    fetchAndDisplayCourses();
                    fetchAndPopulateCoursesForSubjectDropdown();
                } else {
                    showNotification(`Error: ${result.message}`, false);
                }
            } catch (error) {
                console.error('Error creating course:', error);
                showNotification('An error occurred.', false);
            }
        });
    }

    if (createSubjectForm) {
        createSubjectForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(createSubjectForm);
            const data = Object.fromEntries(formData);
            try {
                const response = await fetch('api/create_subject.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification('Subject added successfully!', true);
                    createSubjectForm.reset();
                    fetchAndDisplaySubjects();
                } else {
                    showNotification(`Error: ${result.message}`, false);
                }
            } catch (error) {
                console.error('Error creating subject:', error);
                showNotification('An error occurred.', false);
            }
        });
    }

    courseList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-course-btn')) {
            const courseId = e.target.dataset.id;
            showConfirmation('Delete Course', 'Are you sure you want to delete this course? This will also delete all associated subjects.', async () => {
                try {
                    const response = await fetch('api/delete_course.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ course_id: courseId })
                    });
                    const result = await response.json();
                    if (response.ok && result.success) {
                        showNotification('Course deleted successfully!', true);
                        fetchAndDisplayCourses();
                        fetchAndDisplaySubjects();
                        fetchAndPopulateCoursesForSubjectDropdown();
                    } else {
                        showNotification(`Error: ${result.message}`, false);
                    }
                } catch (error) {
                    console.error('Error deleting course:', error);
                    showNotification('An error occurred.', false);
                }
            });
        }
    });

    subjectList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-subject-btn')) {
            const subjectId = e.target.dataset.id;
            showConfirmation('Delete Subject', 'Are you sure you want to delete this subject?', async () => {
                try {
                    const response = await fetch('api/delete_subject.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subject_id: subjectId })
                    });
                    const result = await response.json();
                    if (response.ok && result.success) {
                        showNotification('Subject deleted successfully!', true);
                        fetchAndDisplaySubjects();
                    } else {
                        showNotification(`Error: ${result.message}`, false);
                    }
                } catch (error) {
                    console.error('Error deleting subject:', error);
                    showNotification('An error occurred.', false);
                }
            });
        }
    });

    submittedExamsList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('grade-exam-btn')) {
            currentAttemptId = e.target.dataset.attemptId;
            try {
                const response = await fetch(`api/get_answers_for_grading.php?attempt_id=${currentAttemptId}`);
                const data = await response.json();
                if (response.ok) {
                    document.getElementById('grade-exam-title').textContent = `Grading: ${data.exam_title} for ${data.student_name}`;
                    gradeExamQuestionsContainer.innerHTML = '';
                    data.answers.forEach(answer => {
                        const questionElement = document.createElement('div');
                        questionElement.className = 'grading-question-item';
                        questionElement.innerHTML = `
                            <h4>${answer.question_text}</h4>
                            <p><strong>Student's Answer:</strong> ${answer.answer_text}</p>
                            <div class="form-group">
                                <label>Marks (out of ${answer.marks})</label>
                                <input type="number" class="marks-input" data-answer-id="${answer.answer_id}" max="${answer.marks}" min="0">
                            </div>
                        `;
                        gradeExamQuestionsContainer.appendChild(questionElement);
                    });
                    gradeExamModal.style.display = 'flex';
                } else {
                    showNotification(`Error: ${data.message}`, false);
                }
            } catch (error) {
                console.error('Error fetching answers for grading:', error);
                showNotification('An error occurred.', false);
            }
        }
    });

    if (finishGradingBtn) {
        finishGradingBtn.addEventListener('click', async () => {
            const grades = [];
            document.querySelectorAll('.marks-input').forEach(input => {
                grades.push({
                    answer_id: input.dataset.answerId,
                    marks_awarded: input.value
                });
            });

            try {
                const response = await fetch('api/grade_exam.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ attempt_id: currentAttemptId, grades: grades })
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    showNotification('Exam graded successfully!', true);
                    gradeExamModal.style.display = 'none';
                    fetchAndDisplaySubmittedExams();
                } else {
                    showNotification(`Error: ${result.message}`, false);
                }
            } catch (error) {
                console.error('Error submitting grades:', error);
                showNotification('An error occurred.', false);
            }
        });
    }

    if (scoreExamFilter) {
        scoreExamFilter.addEventListener('change', () => {
            fetchAndDisplayExamScores(scoreExamFilter.value);
        });
    }

    if (exportScoresBtn) {
        exportScoresBtn.addEventListener('click', async () => {
            const examId = scoreExamFilter.value;
            const examName = scoreExamFilter.options[scoreExamFilter.selectedIndex].text;
            try {
                const response = await fetch(`api/get_exam_scores.php?exam_id=${examId}`);
                const scores = await response.json();
                if (scores.length > 0) {
                    let csvContent = "data:text/csv;charset=utf-8,";
                    csvContent += `Exam: ${examName}\n\n`;
                    csvContent += "Student,Score,Total Marks,Date\n";
                    scores.forEach(score => {
                        const row = [
                            `"${score.student_name}"`,
                            score.score,
                            score.total_marks,
                            `"${new Date(score.end_time).toLocaleDateString()}"`
                        ].join(',');
                        csvContent += row + "\n";
                    });
                    
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `${examName.replace(/\s+/g, '_')}_scores.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    showNotification('No scores to export for this exam.', false);
                }
            } catch (error) {
                console.error('Error exporting scores:', error);
                showNotification('An error occurred while exporting.', false);
            }
        });
    }


    // --- Initial Auth Check ---
    const checkAuthState = async () => {
        try {
            const response = await fetch('api/check_session.php');
            if (response.ok) {
                const data = await response.json();
                if (data.loggedIn && data.role) {
                    setupDashboardUI(data.role);
                } else {
                    showLoginScreen();
                }
            } else {
                showLoginScreen();
            }
        } catch (error) {
            console.error("Error checking auth state:", error);
            showLoginScreen();
        }
    };

    checkAuthState();

    // Utility to show only the selected dashboard section
    function showAdminSection(sectionId) {
        // Hide all admin sections
        document.querySelectorAll('.dashboard-section').forEach(sec => sec.style.display = 'none');
        // Show the requested section
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'block';
    }

    // Admin login logic
    document.getElementById('admin-login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        // Replace with real authentication
        const email = this.admin_email.value;
        const password = this.admin_password.value;
        if (email === 'admin@certifywell.com' && password === 'admin123') {
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            // Show only admin dashboard by default
            showAdminSection('admin-dashboard');
        } else {
            alert('Invalid admin credentials');
        }
    });

    // Show admin login form when "Login as Admin" is clicked
    document.getElementById('show-admin-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('signup-container').style.display = 'none';
        document.getElementById('admin-login-container').style.display = 'block';
    });

    // Sidebar navigation for admin
    document.getElementById('admin-dashboard-link').addEventListener('click', function(e) {
        e.preventDefault();
        showAdminSection('admin-dashboard');
    });
    document.getElementById('admin-manage-users-link').addEventListener('click', function(e) {
        e.preventDefault();
        showAdminSection('admin-manage-users');
    });
    document.getElementById('admin-manage-exams-link').addEventListener('click', function(e) {
        e.preventDefault();
        showAdminSection('examiner-manage-exams');
    });
    document.getElementById('admin-question-bank-link').addEventListener('click', function(e) {
        e.preventDefault();
        showAdminSection('examiner-question-bank');
    });
    document.getElementById('admin-settings-link').addEventListener('click', function(e) {
        e.preventDefault();
        showAdminSection('admin-settings');
    });

    // Hide student/examiner sections for admin
    function hideNonAdminSections() {
        document.getElementById('student-dashboard').style.display = 'none';
        document.getElementById('student-my-exams').style.display = 'none';
        document.getElementById('student-results').style.display = 'none';
        document.getElementById('examiner-dashboard').style.display = 'none';
        document.getElementById('examiner-grade-exams').style.display = 'none';
        document.getElementById('examiner-exam-scores').style.display = 'none';
        document.getElementById('exam-interface').style.display = 'none';
    }
    document.getElementById('admin-login-form').addEventListener('submit', function() {
        setTimeout(hideNonAdminSections, 100);
    });
});
