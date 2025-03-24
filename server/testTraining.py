import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import matplotlib.pyplot as plt
import os
import io
from PIL import Image
import base64

def train_classifier(class_data, img_height=224, img_width=224, epochs=10, batch_size=32):
    """
    Train a CNN classifier with given class data
    
    Parameters:
    -----------
    class_data: list of dicts
        Each dict contains 'name' (class name) and 'images' (list of image data)
    img_height, img_width: int
        Target image dimensions
    epochs: int
        Number of training epochs
    batch_size: int
        Batch size for training
        
    Returns:
    --------
    model: keras.Model
        Trained model
    history: History object
        Training history
    class_names: list
        List of class names in order
    """
    print("Preparing data...")
    
    # Extract class names and prepare data structures
    class_names = [cls["name"] for cls in class_data]
    num_classes = len(class_names)
    
    # Process images and labels
    images = []
    labels = []
    
    for class_idx, cls in enumerate(class_data):
        for img_data in cls["images"]:
            # Assume img_data could be base64 encoded
            try:
                # Try to decode if it's base64 encoded
                if isinstance(img_data, str) and img_data.startswith('data:image'):
                    # Extract the base64 part
                    img_data = img_data.split(',')[1]
                    img = Image.open(io.BytesIO(base64.b64decode(img_data)))
                elif isinstance(img_data, str):
                    # Might be a file path
                    img = Image.open(img_data)
                else:
                    # Might be bytes
                    img = Image.open(io.BytesIO(img_data))
                
                # Convert to RGB if needed
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize and convert to array
                img = img.resize((img_width, img_height))
                img_array = image.img_to_array(img)
                images.append(img_array)
                labels.append(class_idx)
            except Exception as e:
                print(f"Error processing image in class {cls['name']}: {e}")
                continue
    
    # Convert to numpy arrays
    X = np.array(images)
    y = np.array(labels)
    
    # Preprocess input images
    X = preprocess_input(X)
    
    # Convert labels to categorical
    y_categorical = tf.keras.utils.to_categorical(y, num_classes=num_classes)
    
    # Split data into training and validation sets (80/20)
    indices = np.random.permutation(len(X))
    split_idx = int(0.8 * len(X))
    train_indices = indices[:split_idx]
    val_indices = indices[split_idx:]
    
    X_train, y_train = X[train_indices], y_categorical[train_indices]
    X_val, y_val = X[val_indices], y_categorical[val_indices]
    
    print(f"Training set: {len(X_train)} images")
    print(f"Validation set: {len(X_val)} images")
    print(f"Number of classes: {num_classes}")
    
    # Create data generators with augmentation for training
    data_augmentation = models.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
    ])
    
    # Build model
    print("Building model...")
    
    # Use MobileNetV2 as base model
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(img_height, img_width, 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Freeze base model
    
    model = models.Sequential([
        data_augmentation,
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.2),
        layers.Dense(128, activation='relu'),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    # Compile model
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Print model summary
    model.summary()
    
    # Train model
    print("Training model...")
    history = model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_data=(X_val, y_val),
        callbacks=[
            tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(factor=0.2, patience=2)
        ]
    )
    
    # Evaluate model
    print("Evaluating model...")
    val_loss, val_accuracy = model.evaluate(X_val, y_val)
    print(f"Validation accuracy: {val_accuracy:.4f}")
    
    # Plot training history
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'])
    plt.plot(history.history['val_accuracy'])
    plt.title('Model Accuracy')
    plt.ylabel('Accuracy')
    plt.xlabel('Epoch')
    plt.legend(['Train', 'Validation'], loc='lower right')
    
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.title('Model Loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend(['Train', 'Validation'], loc='upper right')
    
    plt.tight_layout()
    plt.savefig('training_history.png')
    plt.show()
    
    return model, history, class_names

def save_model(model, filename='model.h5'):
    """Save model to H5 format"""
    model.save(filename)
    print(f"Model saved to {filename}")
    return filename

if __name__ == "__main__":
    # Example usage (when used as a standalone script)
    # This would be replaced with your actual class_data
    class_data = [
        {"name": "Class1", "images": ["image1.jpg", "image2.jpg"]},
        {"name": "Class2", "images": ["image3.jpg", "image4.jpg"]}
    ]
    
    # Train the model
    model, history, class_names = train_classifier(class_data)
    
    # Save the model to H5 format
    save_model(model, "trained_model.h5")
    
    # Print class mapping for future reference
    for idx, name in enumerate(class_names):
        print(f"Class {idx}: {name}")