const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors");


dotenv.config();

const corsOptions = {
    //origin: 'https://easypassword-gen.vercel.app', 
    origin: 'http://localhost:5173', 
    credentials: true,
  };
  

 

const app = express();
app.use(cors(corsOptions));
app.use(express.json());


// Function to convert binary to decimal (handling both integer and fractional parts)
const binaryToDecimal = (binary) => {
    const [integerPart, fractionalPart] = String(binary).split('.');
    const integerDecimal = parseInt(integerPart, 2);
    if (!fractionalPart) return integerDecimal;

    let fractionalDecimal = 0;
    for (let i = 0; i < fractionalPart.length; i++) {
        fractionalDecimal += parseInt(fractionalPart[i], 10) * Math.pow(2, -(i + 1));
    }
    return integerDecimal + fractionalDecimal;
};

// Function to convert decimal to binary (handling both integer and fractional parts)
const decimalToBinary = (decimal) => {
    const integerPart = Math.floor(decimal);
    const fractionalPart = decimal - integerPart;
    const integerBinary = integerPart.toString(2);
    if (fractionalPart === 0) return integerBinary;

    let fractionalBinary = '';
    let fraction = fractionalPart;
    while (fraction > 0) {
        fraction *= 2;
        if (fraction >= 1) {
            fractionalBinary += '1';
            fraction -= 1;
        } else {
            fractionalBinary += '0';
        }
        // Limit the length of fractional binary to avoid infinite loops
        if (fractionalBinary.length > 20) break;
    }
    return `${integerBinary}.${fractionalBinary}`;
};

// Function to convert signed 2's complement binary to decimal
const signedTwosComplementToDecimal = (binary) => {
    const isNegative = binary[0] === '1';
    if (!isNegative) {
        return binaryToDecimal(binary);
    }
    const invertedBinary = binary.split('').map(bit => bit === '0' ? '1' : '0').join('');
    const decimal = binaryToDecimal(invertedBinary) + 1;
    return -decimal;
};

// Function to convert decimal to hexadecimal
const decimalToHex = (decimal) => {
    return parseFloat(decimal).toString(16).toUpperCase();
};

// Function to convert binary to hexadecimal
const binaryToHex = (binary) => {
    const decimal = binaryToDecimal(binary);
    return decimalToHex(decimal);
};

// Function to provide detailed decimal calculation steps from binary
const binaryToDecimalWithSteps = (binary) => {
    let [integerPart, fractionalPart] = String(binary).split('.');
    let steps = [];
    let integerDecimal = 0;

    // Calculate the integer part
    let integerCalculation = '';
    for (let i = 0; i < integerPart.length; i++) {
        let bitValue = parseInt(integerPart[i], 10) * Math.pow(2, integerPart.length - i - 1);
        integerCalculation += `(${integerPart[i]} × 2^${integerPart.length - i - 1})`;
        integerDecimal += bitValue;
        if (i < integerPart.length - 1) {
            integerCalculation += ' + ';
        }
    }
    steps.push(`${integerCalculation} = ${integerDecimal}`);

    let totalDecimal = integerDecimal;

    if (fractionalPart) {
        let fractionalDecimal = 0;
        let fractionalCalculation = '';
        for (let i = 0; i < fractionalPart.length; i++) {
            let bitValue = parseInt(fractionalPart[i], 10) * Math.pow(2, -(i + 1));
            fractionalDecimal += bitValue;
            fractionalCalculation += `(${fractionalPart[i]} × 2^-${i + 1})`;
            if (i < fractionalPart.length - 1) {
                fractionalCalculation += ' + ';
            }
        }
        steps.push(`${fractionalCalculation} = ${fractionalDecimal}`);
        totalDecimal += fractionalDecimal;
    }

    steps.push(`Total: ${totalDecimal}`);
    return { totalDecimal, steps };
};

// Route to convert binary to decimal
app.post('/convert/binary-to-decimal', (req, res) => {
    const { binary } = req.body;    
    if (!/^[01]+(\.[01]+)?$/.test(binary)) {
        return res.status(400).json({ error: 'Invalid binary number' });
    }
    const decimal = binaryToDecimal(binary);
    res.json({result: decimal, binary });
});

// Route to convert decimal to binary
app.post('/convert/decimal-to-binary', (req, res) => {
    const { decimal } = req.body;
    if (isNaN(decimal)) {
        return res.status(400).json({ error: 'Invalid decimal number' });
    }
    const binary = decimalToBinary(parseFloat(decimal));
    res.json({ decimal, result: binary });
});

// Route to convert signed 2's complement binary to decimal
app.post('/convert/signed-binary-to-decimal', (req, res) => {
    const { binary } = req.body;
    if (!/^[01]+$/.test(binary)) {
        return res.status(400).json({ error: 'Invalid binary number' });
    }
    const decimal = signedTwosComplementToDecimal(binary);
    res.json({ binary, result: decimal });
});

// Route to convert decimal to hex
app.post('/convert/decimal-to-hex', (req, res) => {
    const { decimal } = req.body;
    if (isNaN(decimal)) {
        return res.status(400).json({ error: 'Invalid decimal number' });
    }
    const hex = decimalToHex(parseFloat(decimal));
    res.json({ decimal, result: hex });
});

// Route to convert binary to hex
app.post('/convert/binary-to-hex', (req, res) => {
    const { binary } = req.body;
    if (!/^[01]+(\.[01]+)?$/.test(binary)) {
        return res.status(400).json({ error: 'Invalid binary number' });
    }
    const hex = binaryToHex(binary);
    res.json({ binary, result :hex });
});

// Route to get detailed decimal calculation steps from binary
app.post('/convert/binary-to-decimal-steps', (req, res) => {
    const { binary } = req.body;
    if (!/^[01]+(\.[01]+)?$/.test(binary)) {
        return res.status(400).json({ error: 'Invalid binary number' });
    }
    const { totalDecimal, steps } = binaryToDecimalWithSteps(binary);
    res.json({ binary, decimal: totalDecimal, steps });
});
 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
