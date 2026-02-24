import React from 'react';
import JobList from './components/JobList';

function App() {
  // Using a test email to fetch candidate info as per instructions.
  // This could also be a prop, context, or state based on a login screen.
  const userEmail = "marianoinsaurralde5@gmail.com";

  return (
    <div className="App">
      <JobList email={userEmail} />
    </div>
  );
}

export default App;
