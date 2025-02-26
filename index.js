require('dotenv').config();
const express = require('express');
const { AzureOpenAI } = require('openai');
const { Sequelize } = require('sequelize');
const endpoint = process.env.endpoint;
const apiKey = process.env.apiKey;
const apiVersion = process.env.apiVersion;
const deployment = process.env.deployment;
const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
const cors = require('cors');
const app = express();
const db = require('./db');
const createDBModel = require('./db');
const { createAmazonBedrock } = require('@ai-sdk/amazon-bedrock');
const { BedrockClient, GenerateTextCommand } = require("@aws-sdk/client-bedrock");
const region = process.env.region;
const accessKeyId = process.env.accessKeyId;
const secretAccessKey = process.env.secretAccessKey;
const clients = new BedrockClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
app.use(cors());

app.use(express.json());

//db connection
let sequelize = new Sequelize('gpt', 'postgres', 'sumit@4307', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432
});

sequelize
    .authenticate()
    .then(() => {
        console.log("Connection has been established successfully");
    })
    .catch((error) => {
        console.error("Unable to connect to the database:", error);
    });
const DBModel = createDBModel(sequelize);
sequelize
    .sync({ alter: true })
    .then(() => {
        console.log("sync")
    })
    .catch((err) => {
        console.log(err);
    });

const conversationHistory = [];
app.post('/gpt', async (req, res) => {
    console.log(req.body);

     // Add the user's message to the conversation history
     conversationHistory.push({ role: "user", content: req.body.message });
    const prompt = [
        { role: "system", content: "You are a professional developer." },
        ...conversationHistory];
        // const command = new GenerateTextCommand({
        //     input: { text: prompt }, // Corrected the structure
        //     maxTokens: 2048,
        //     temperature: 0.7,
        //   });
        //   let response;
        //   try {
        //     response = await client.send(command);
        //     // return response;
        //   } catch (error) {
        //     console.error("Error generating text:", error);
        //     throw error;
        //   }
    const result = await client.chat.completions.create({
        messages: prompt,
        model: ""
    });

    try {
        const newRow = await DBModel.create({
            prompt: req.body.message,
            response: result.choices[0].message.content
        });
        console.log('New row inserted:');
    } catch (error) {
        console.error('Error inserting new row:', error);
    }

    res.send(JSON.stringify(result.choices[0].message.content));
})

app.get('/', (req, res) => {
    res.send('Hello World!');
});
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tnrrtqoukdsygsighuqo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucnJ0cW91a2RzeWdzaWdodXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4NzIyNDgsImV4cCI6MjA1NTQ0ODI0OH0.pNG4mpcz2ZnwU-Sll37SPJQ59NiRthDUB_WxC6kYkuc";

export const supabase = createClient(https://tnrrtqoukdsygsighuqo.supabase.co, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucnJ0cW91a2RzeWdzaWdodXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4NzIyNDgsImV4cCI6MjA1NTQ0ODI0OH0.pNG4mpcz2ZnwU-Sll37SPJQ59NiRthDUB_WxC6kYkuc);


async function signUp(email, password) {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Signup error:", error.message);
  } else {
    console.log("User signed up:", user);
  }
}


async function signIn(email, password) {
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error.message);
  } else {
    console.log("User logged in:", user);
  }
}

async function signOut() {
  await supabase.auth.signOut();
  console.log("User signed out");
}

async function saveMessage(userId, message) {
  const { error } = await supabase
    .from("chat_history")
    .insert([{ user_id: userId, message }]);

  if (error) {
    console.error("Error saving message:", error.message);
  }
}

async function getChatHistory(userId) {
  const { data, error } = await supabase
    .from("chat_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat history:", error.message);
    return [];
  }

  return data;
}


app.listen(5000, () => {
    console.log('Example app listening on port 5000!');
});

