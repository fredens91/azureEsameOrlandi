import 'reflect-metadata';
import dotenv from 'dotenv';
import app from './app';
import mongoose from 'mongoose';

mongoose.set('debug', true);
mongoose.connect('mongodb+srv://orlandifederico91:s7lSMxx6hw2hbyP4@clusterfede.ahcri.mongodb.net/?retryWrites=true&w=majority&appName=ClusterFede')
  .then(_ => {
    console.log('Connected to db');
    app.listen(3000, () => {
      console.log('Server listening on port 3000')
    });
  })
  .catch(err => {
    console.error(err);
  })
