\# ConnectHub – Social Media Platform



A full-stack social media platform developed as part of the \*\*CodeAlpha Full Stack Development Internship\*\*.



\## 🚀 Features



\* User Registration and Login

\* JWT-based Authentication

\* User Profiles

\* Create, Edit and Delete Posts

\* Like and Unlike Posts

\* Add Comments

\* Search Posts

\* Follow and Unfollow Users

\* Followers and Following Data

\* People to Follow Section

\* Logout

\* Responsive User Interface

\* JSON-based Data Storage



\## 🛠️ Technologies Used



\### Frontend



\* HTML5

\* CSS3

\* JavaScript



\### Backend



\* Node.js

\* Express.js

\* JWT Authentication

\* bcryptjs

\* JSON-based storage



\## 📁 Project Structure



```text

CodeAlpha\_SocialMediaPlatform/

│

├── backend/

│   ├── routes/

│   │   ├── auth.js

│   │   └── posts.js

│   ├── posts.json

│   ├── users.json

│   ├── package.json

│   ├── package-lock.json

│   └── server.js

│

├── frontend/

│   ├── css/

│   │   └── style.css

│   ├── js/

│   │   ├── dashboard.js

│   │   ├── profile.js

│   │   └── script.js

│   ├── dashboard.html

│   ├── index.html

│   └── profile.html

│

├── .gitignore

└── README.md

```



\## ⚙️ How to Run



\### 1. Clone the repository



```bash

git clone https://github.com/keerthanac200/CodeAlpha\_SocialMediaPlatform.git

```



\### 2. Open the project



```bash

cd CodeAlpha\_SocialMediaPlatform

```



\### 3. Install backend dependencies



```bash

cd backend

npm install

```



\### 4. Start the backend server



```bash

npm start

```



The backend runs on:



```text

http://localhost:5000

```



\### 5. Open the frontend



Open:



```text

frontend/index.html

```



in your browser.



\## 🔐 Authentication



The application uses \*\*JWT-based authentication\*\* to protect user-specific API operations.



Passwords are securely hashed using \*\*bcryptjs\*\* before being stored.



\## 👥 Follow System



Users can:



\* View other registered users

\* Follow users

\* Unfollow users

\* Maintain followers and following relationships



Follower and following relationships are stored in the backend user data.



\## 🎯 Internship Project



This project was developed for \*\*Project 2 – Social Media Platform\*\* as part of the \*\*CodeAlpha Full Stack Development Internship\*\*.



\## 👩‍💻 Author



\*\*Keerthana C\*\*



Information Science Engineering

B.Tech – 2nd Year



