Althea Health Simulator
Althea is an interactive, web-based health symptom simulator designed to demonstrate the principles of a rule-based expert system. Inspired by pioneering AI projects like MYCIN and DENDRAL, this application provides users with a tool to explore potential health conditions by selecting their symptoms from a comprehensive list. It calculates potential matches based on a weighted scoring system and provides detailed, user-friendly information for educational purposes.

The entire project is built with vanilla HTML, CSS, and JavaScript, emphasizing clean code and foundational web technologies without reliance on external frameworks.

📜 Project Purpose & Inspiration
The goal of this project was to create a modern, accessible demonstration of how early AI expert systems functioned. While today's medical technology uses far more advanced algorithms, the core logic of mapping inputs (symptoms) to a structured knowledge base remains a fundamental concept.

This project serves as both a portfolio piece showcasing strong front-end development skills and an educational tool for those interested in the history of AI and its application in medicine.

✨ Key Features
Interactive Symptom Selection: A clean, searchable, and categorized interface for users to select their symptoms.

Dynamic Tag Bar: Displays selected symptoms for easy review and removal.

Weighted Scoring Algorithm: The simulator.js logic calculates a "symptom match score" based on predefined weights for each symptom relative to a disease, providing a more nuanced result than a simple match count.

Detailed Results Display: Presents potential conditions with a confidence bar, description, common self-care suggestions, medication guidance, and dietary advice.

Expandable Knowledge Base: The entire medical knowledge base is powered by two simple JSON files (symptoms.json and diseases.json), making it incredibly easy to add new symptoms and conditions without touching the core application logic.

Responsive Design: A mobile-first, fully responsive layout ensures a seamless experience on all devices.

Theme Toggle: A light/dark mode theme toggle for user preference.

💻 Technology Stack
HTML5: For the structure and content of the web pages.

CSS3: For all styling, including a responsive layout, theme variables, and animations.

Vanilla JavaScript (ES6+): For all application logic, including:

Fetching and parsing JSON data.

Dynamically generating HTML content.

Handling all user interactions and form submissions.

Implementing the search/filter functionality.

Calculating the diagnostic scores.

🚀 Getting Started
To run this project locally, simply clone the repository and open the index.html file in your web browser.

# Clone the repository
git clone [https://github.com/your-username/althea-health-simulator.git](https://github.com/your-username/althea-health-simulator.git)

# Navigate to the project directory
cd althea-health-simulator

# Open index.html in your browser
# (You can do this by double-clicking the file in your file explorer)

Note: Because the application uses the fetch() API to load local JSON files, you may need to run it through a simple local server to avoid potential CORS (Cross-Origin Resource Sharing) errors in some browsers. A quick way to do this is with the Live Server extension in Visual Studio Code or by running a simple Python server:

# In the project directory, run:
python -m http.server

Then navigate to http://localhost:8000 in your browser.

📁 File Structure
/
├── index.html              # Main landing page
├── about.html              # About the project and developer
├── simulations.html        # The core simulator application page
├── resources
