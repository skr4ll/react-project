import { useState, useEffect } from 'react';
import './App.css';

// Utility function to decode HTML entities
const decodeHtmlEntities = (str) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = str;
  return textArea.value;
};

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // Track sorting order
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    // Fetch data from the API on page load
    fetch('https://opentdb.com/api.php?amount=50')
      .then((response) => response.json())
      .then((json) => {
        // Decode HTML entities in the API response
        const decodedResults = json.results.map((item) => ({
          ...item,
          question: decodeHtmlEntities(item.question),
          correct_answer: decodeHtmlEntities(item.correct_answer),
          incorrect_answers: item.incorrect_answers.map((answer) =>
            decodeHtmlEntities(answer)
          ),
          category: decodeHtmlEntities(item.category),
        }));
        setData(decodedResults);
        setFilteredData(decodedResults); // Initialize filtered data
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    const sortedData = [...filteredData].sort((a, b) => {
      if (field === 'type') {
        const typeOrder = { multiple: 1, boolean: 2 };
        return order === 'asc'
          ? typeOrder[a[field]] - typeOrder[b[field]]
          : typeOrder[b[field]] - typeOrder[a[field]];
      } else if (field === 'difficulty') {
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return order === 'asc'
          ? difficultyOrder[a[field]] - difficultyOrder[b[field]]
          : difficultyOrder[b[field]] - difficultyOrder[a[field]];
      } else {
        return order === 'asc'
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }
    });
    setFilteredData(sortedData);
    setSortField(field);
    setSortOrder(order);
  };

  const handleFilter = () => {
    const filtered = data.filter((item) =>
      item[filterField]?.toString().toLowerCase().includes(filterValue.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <div className="App">
      <h1>Trivia Questions</h1>

      {/* Filtering */}
      <div>
        <label htmlFor="filterField">Filter by field:</label>
        <select
          id="filterField"
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
        >
          <option value="">Select a field</option>
          <option value="type">Type</option>
          <option value="difficulty">Difficulty</option>
          <option value="category">Category</option>
        </select>
        <select
          id="filterValue"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          disabled={!filterField} // Disable until a field is selected
        >
          <option value="">Select a value</option>
          {filterField &&
            [...new Set(data.map((item) => item[filterField]))].map((value, index) => (
              <option key={index} value={value} onClick={handleFilter}>
                {value}
              </option>
            ))}
        </select>
      </div>
      <br />
      <table border="1">
        <thead>
          <tr>
            <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
              Category {sortField === 'category' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
              Type {sortField === 'type' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('difficulty')} style={{ cursor: 'pointer' }}>
              Difficulty {sortField === 'difficulty' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th>Question</th>
            <th>Correct Answer</th>
            <th>Incorrect Answers</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item.category}</td>
              <td>{item.type}</td>
              <td>{item.difficulty}</td>
              <td>{item.question}</td>
              <td>{item.correct_answer}</td>
              <td>{item.incorrect_answers.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;