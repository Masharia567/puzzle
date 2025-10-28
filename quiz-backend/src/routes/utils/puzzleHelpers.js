// Helper function to validate puzzle data
export function validatePuzzleData(type, content) {
  try {
    let data = content;
    
    // Parse JSON string if needed
    if (typeof content === 'string') {
      try {
        data = JSON.parse(content);
      } catch (e) {
        // If not valid JSON, treat as raw string for certain types
        data = content;
      }
    }

    switch (type) {
      case 'sudoku':
        return validateSudoku(data);
      
      case 'crossword':
        return validateCrossword(data);
      
      case 'word_search':
        return validateWordSearch(data);
      
      default:
        return { isValid: false, error: 'Invalid puzzle type' };
    }
  } catch (error) {
    return { 
      isValid: false, 
      error: `Invalid puzzle data format: ${error.message}` 
    };
  }
}

// Sudoku validation
function validateSudoku(data) {
  try {
    let grid;

    // If data is a 2D array, use it directly
    if (Array.isArray(data)) {
      grid = data;
    } 
    // If data is a string with newlines, parse it
    else if (typeof data === 'string' && data.includes('\n')) {
      const lines = data.trim().split('\n').filter(line => line.trim());
      
      if (lines.length !== 9) {
        return { 
          isValid: false, 
          error: `Sudoku must have exactly 9 rows. Found ${lines.length} rows.` 
        };
      }
      
      grid = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].replace(/\s/g, '');
        if (line.length !== 9) {
          return { 
            isValid: false, 
            error: `Row ${i + 1} must have exactly 9 digits. Found ${line.length}.` 
          };
        }
        
        const row = line.split('').map(char => {
          const num = parseInt(char);
          if (isNaN(num) || num < 0 || num > 9) {
            throw new Error(`Invalid digit '${char}' in row ${i + 1}. Use 0-9 only.`);
          }
          return num === 0 ? '' : num.toString();
        });
        
        grid.push(row);
      }
    }
    // Otherwise expect grid structure
    else if (data && Array.isArray(data)) {
      grid = data;
    } else {
      return { 
        isValid: false, 
        error: 'Sudoku data must be a 9x9 array or multi-line string' 
      };
    }

    // Validate grid structure
    if (!Array.isArray(grid) || grid.length !== 9) {
      return { 
        isValid: false, 
        error: 'Sudoku must have exactly 9 rows' 
      };
    }

    for (let i = 0; i < 9; i++) {
      if (!Array.isArray(grid[i]) || grid[i].length !== 9) {
        return { 
          isValid: false, 
          error: `Row ${i + 1} must have exactly 9 cells` 
        };
      }
      
      // Validate each cell
      for (let j = 0; j < 9; j++) {
        const cell = grid[i][j];
        if (cell !== '' && cell !== 0) {
          const num = parseInt(cell);
          if (isNaN(num) || num < 1 || num > 9) {
            return { 
              isValid: false, 
              error: `Invalid value at row ${i + 1}, col ${j + 1}. Must be 1-9 or empty.` 
            };
          }
        }
      }
    }

    return { 
      isValid: true, 
      processedData: { grid } 
    };
  } catch (error) {
    return { 
      isValid: false, 
      error: `Sudoku validation error: ${error.message}` 
    };
  }
}

// Crossword validation
function validateCrossword(data) {
  try {
    let parsed = data;

    if (typeof data === 'string') {
      parsed = JSON.parse(data);
    }

    if (!parsed || typeof parsed !== 'object') {
      return { 
        isValid: false, 
        error: 'Crossword data must be a valid object' 
      };
    }

    if (!parsed.across || !Array.isArray(parsed.across)) {
      return { 
        isValid: false, 
        error: 'Crossword must have an "across" array' 
      };
    }

    if (!parsed.down || !Array.isArray(parsed.down)) {
      return { 
        isValid: false, 
        error: 'Crossword must have a "down" array' 
      };
    }

    // Validate across clues
    for (const clue of parsed.across) {
      if (!clue.number || !clue.clue || !clue.answer) {
        return { 
          isValid: false, 
          error: 'Each across clue must have: number, clue, and answer' 
        };
      }
      if (typeof clue.answer !== 'string' || clue.answer.length === 0) {
        return { 
          isValid: false, 
          error: `Across clue ${clue.number} must have a valid answer` 
        };
      }
    }

    // Validate down clues
    for (const clue of parsed.down) {
      if (!clue.number || !clue.clue || !clue.answer) {
        return { 
          isValid: false, 
          error: 'Each down clue must have: number, clue, and answer' 
        };
      }
      if (typeof clue.answer !== 'string' || clue.answer.length === 0) {
        return { 
          isValid: false, 
          error: `Down clue ${clue.number} must have a valid answer` 
        };
      }
    }

    return { isValid: true, processedData: parsed };
  } catch (error) {
    return { 
      isValid: false, 
      error: `Crossword validation error: ${error.message}` 
    };
  }
}

// Word Search validation
function validateWordSearch(data) {
  try {
    let words;

    if (typeof data === 'string') {
      // Parse comma-separated words
      words = data.split(',')
        .map(w => w.trim().toUpperCase())
        .filter(w => w.length > 0);
    } else if (data && Array.isArray(data.words)) {
      words = data.words;
    } else if (Array.isArray(data)) {
      words = data;
    } else {
      return { 
        isValid: false, 
        error: 'Word search data must be comma-separated string or array of words' 
      };
    }

    if (words.length === 0) {
      return { 
        isValid: false, 
        error: 'Word search must have at least one word' 
      };
    }

    // Validate word length (for grid generation)
    const maxWordLength = Math.max(...words.map(w => w.length));
    if (maxWordLength > 15) {
      return { 
        isValid: false, 
        error: 'Words must be 15 characters or less for grid generation' 
      };
    }

    // Validate characters (letters only)
    for (const word of words) {
      if (!/^[A-Z]+$/i.test(word)) {
        return { 
          isValid: false, 
          error: `Word "${word}" contains invalid characters. Use letters only.` 
        };
      }
    }

    return { 
      isValid: true, 
      processedData: { words, grid: null } 
    };
  } catch (error) {
    return { 
      isValid: false, 
      error: `Word search validation error: ${error.message}` 
    };
  }
}

// Helper function to verify solution
export function verifySolution(type, puzzleData, solution) {
  try {
    switch (type) {
      case 'sudoku':
        return verifySudokuSolution(puzzleData, solution);
      
      case 'crossword':
        return verifyCrosswordSolution(puzzleData, solution);
      
      case 'word_search':
        return verifyWordSearchSolution(puzzleData, solution);
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Solution verification error:', error);
    return false;
  }
}

function verifySudokuSolution(puzzleData, solution) {
  try {
    let grid = solution;

    // Parse if needed
    if (typeof solution === 'string') {
      grid = JSON.parse(solution);
    }

    // Handle different solution formats
    if (solution.grid) {
      grid = solution.grid;
    }

    // Basic validation - check if solution is a valid 9x9 grid
    if (!Array.isArray(grid) || grid.length !== 9) {
      return false;
    }
    
    for (const row of grid) {
      if (!Array.isArray(row) || row.length !== 9) {
        return false;
      }
      
      // Check if all numbers are 1-9
      for (const cell of row) {
        const num = parseInt(cell);
        if (isNaN(num) || num < 1 || num > 9) {
          return false;
        }
      }
    }
    
    // Check rows for duplicates
    for (const row of grid) {
      const nums = row.map(c => parseInt(c));
      const seen = new Set(nums);
      if (seen.size !== 9 || !seen.has(1) || !seen.has(9)) {
        return false;
      }
    }
    
    // Check columns for duplicates
    for (let col = 0; col < 9; col++) {
      const seen = new Set();
      for (let row = 0; row < 9; row++) {
        seen.add(parseInt(grid[row][col]));
      }
      if (seen.size !== 9 || !seen.has(1) || !seen.has(9)) {
        return false;
      }
    }
    
    // Check 3x3 boxes for duplicates
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const seen = new Set();
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            seen.add(parseInt(grid[boxRow * 3 + row][boxCol * 3 + col]));
          }
        }
        if (seen.size !== 9 || !seen.has(1) || !seen.has(9)) {
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Sudoku verification error:', error);
    return false;
  }
}

function verifyCrosswordSolution(puzzleData, solution) {
  try {
    // Verify all answers match
    if (!solution || typeof solution !== 'object') {
      return false;
    }
    
    // Check across answers
    if (puzzleData.across) {
      for (const clue of puzzleData.across) {
        const userAnswer = solution[`across_${clue.number}`] || solution[`${clue.number}_across`];
        if (!userAnswer || userAnswer.toUpperCase().trim() !== clue.answer.toUpperCase().trim()) {
          return false;
        }
      }
    }
    
    // Check down answers
    if (puzzleData.down) {
      for (const clue of puzzleData.down) {
        const userAnswer = solution[`down_${clue.number}`] || solution[`${clue.number}_down`];
        if (!userAnswer || userAnswer.toUpperCase().trim() !== clue.answer.toUpperCase().trim()) {
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Crossword verification error:', error);
    return false;
  }
}

function verifyWordSearchSolution(puzzleData, solution) {
  try {
    // Verify all words were found
    let foundWords = solution;

    if (solution.words) {
      foundWords = solution.words;
    }

    if (!Array.isArray(foundWords) || !Array.isArray(puzzleData.words)) {
      return false;
    }
    
    const foundWordsUpper = foundWords.map(w => w.toUpperCase().trim());
    const requiredWords = puzzleData.words.map(w => w.toUpperCase().trim());
    
    // Check if all required words are in the solution
    for (const word of requiredWords) {
      if (!foundWordsUpper.includes(word)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Word search verification error:', error);
    return false;
  }
}