<h1 align="center">CertifyWell: Online Examination Portal</h1>

<p align="center"><b>Create, deliver and grade exams online, with token-based exam access for students.</b></p>

<p align="center">![PHP](https://img.shields.io/badge/PHP-777BB4?logo=php&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css&logoColor=white)</p>

## Overview

CertifyWell online examination portal: PHP + MySQL API with a JavaScript frontend for courses, subjects, question banks, token-protected exams, grading and results.

## Features

- Roles for administrators, examiners and students with session-based sign-in
- Courses, subjects and a reusable question bank
- Build exams by adding/removing questions
- One-time exam tokens so only invited students can start an exam
- Start, submit and grade exams; students see their results
- User management (deactivate, delete)

## Tech stack

PHP · MySQL · JavaScript · HTML5 · CSS3

## Getting started

1. Install [XAMPP](https://www.apachefriends.org/) (Apache + PHP + MySQL).
2. Copy this folder into `htdocs/`.
3. Create a MySQL database in phpMyAdmin and update the connection settings (`api/db_mysql.php`).
4. Open `http://localhost/exam-portal/` in your browser.

## Project structure

`api/` one PHP endpoint per action (create_exam, submit_exam, grade_exam, ...) · `index.html`, `scripts.js`, `styles.css` frontend

---

<p align="center">Built by <a href="https://github.com/allan818181"><b>Allan Muganyizi Deus</b></a> · Full-Stack &amp; DevOps Engineer · Dar es Salaam, Tanzania<br/>
<a href="https://www.linkedin.com/in/allan-deus-4b888631a">LinkedIn</a> · <a href="mailto:allandeus014@gmail.com">Email</a></p>
