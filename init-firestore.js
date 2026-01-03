const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeFirestore() {
  try {
    // Create projects collection
    const projectsRef = db.collection('projects');
    
    // Create tasks collection
    const tasksRef = db.collection('tasks');
    
    // Create users collection
    const usersRef = db.collection('users');
    
    // Add a test document to each collection to ensure they're created
    await Promise.all([
      projectsRef.doc('sample').set({
        name: 'Sample Project',
        description: 'This is a sample project',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }),
      tasksRef.doc('sample-task').set({
        title: 'Sample Task',
        description: 'This is a sample task',
        status: 'todo',
        projectId: 'sample',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }),
      usersRef.doc('sample-user').set({
        email: 'sample@example.com',
        role: 'manager',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
    ]);

    console.log('Firestore initialized successfully!');
    console.log('Created collections: projects, tasks, users');
    
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  } finally {
    // Close the connection
    process.exit(0);
  }
}

// Run the initialization
initializeFirestore();
