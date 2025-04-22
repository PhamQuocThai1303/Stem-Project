import pandas as pd
import numpy as np
from datetime import datetime

def calculate_metrics(history_dict):
    """Tính toán các metrics đánh giá từ history"""
    metrics = {
        'Độ chính xác cao nhất (Training)': max(history_dict['accuracy']),
        'Độ chính xác cao nhất (Validation)': max(history_dict['val_accuracy']),
        'Loss thấp nhất (Training)': min(history_dict['loss']),
        'Loss thấp nhất (Validation)': min(history_dict['val_loss']),
        'Epoch hội tụ': next((i for i, (acc, val_acc) in enumerate(zip(history_dict['accuracy'], history_dict['val_accuracy']), 1) 
                            if acc > 0.99 and val_acc > 0.99), None),
        'Thời gian hội tụ (epochs)': len(history_dict['loss']),
        'Độ ổn định': np.std(history_dict['val_accuracy'][-10:]),  # Độ ổn định 10 epoch cuối
        'Overfitting metric': max(np.array(history_dict['accuracy']) - np.array(history_dict['val_accuracy']))
    }
    return metrics

def create_training_report(history_dict, model_params):
    """
    Tạo báo cáo training từ history và model parameters
    
    Args:
        history_dict: dict chứa history của quá trình training
        model_params: dict chứa các thông số của model
    """
    # 1. Bảng Thông Số Mô Hình (Model Architecture)
    model_architecture = {
        'Thông số': [
            'Kiến trúc mô hình',
            'Số lớp',
            'Input Shape',
            'Backbone',
            'Activation Function',
            'Optimizer',
            'Loss Function',
            'Metrics'
        ],
        'Giá trị': [
            model_params['model_architecture'],
            str(model_params['num_layers']),
            str(model_params['input_shape']),
            'MobileNetV2 (pretrained)',
            'ReLU, Softmax',
            'Adam',
            'Categorical Crossentropy',
            'Accuracy'
        ],
        'Mô tả': [
            'Mô hình CNN cho classification',
            'Input + Base + GAP + Dropout + Dense + Output',
            'Kích thước ảnh đầu vào',
            'Sử dụng pretrained weights từ ImageNet',
            'ReLU cho hidden, Softmax cho output',
            'Adaptive learning rate optimization',
            'Loss function cho multi-class classification',
            'Độ chính xác phân loại'
        ]
    }

    # 2. Bảng Thông Số Training (Training Parameters)
    training_params = {
        'Thông số': [
            'Số lượng mẫu training',
            'Số lượng mẫu validation',
            'Số lớp (classes)',
            'Batch Size',
            'Epochs',
            'Initial Learning Rate',
            'Early Stopping Patience',
            'Reduce LR Patience',
            'Class Weights'
        ],
        'Giá trị': [
            str(model_params['training_samples']),
            str(model_params['validation_samples']),
            str(model_params['num_classes']),
            str(model_params['batch_size']),
            str(model_params['epochs']),
            str(model_params['learning_rate']),
            str(model_params['early_stopping_patience']),
            str(model_params['reduce_lr_patience']),
            str(model_params['class_weights'])
        ],
        'Mô tả': [
            'Số lượng ảnh dùng để train',
            'Số lượng ảnh dùng để validate',
            'Số lượng class cần phân loại',
            'Số lượng mẫu mỗi batch',
            'Số lần lặp toàn bộ dataset',
            'Learning rate khởi tạo',
            'Dừng training khi không cải thiện',
            'Giảm LR khi validation loss không cải thiện',
            'Trọng số cho mỗi class'
        ]
    }

    # 3. Bảng Data Augmentation
    augmentation = model_params['data_augmentation']
    data_augmentation = {
        'Kỹ thuật': [
            'Rotation Range',
            'Width Shift Range',
            'Height Shift Range',
            'Horizontal Flip',
            'Vertical Flip',
            'Brightness Range',
            'Zoom Range'
        ],
        'Giá trị': [
            f"{augmentation['rotation_range']}°",
            str(augmentation['width_shift_range']),
            str(augmentation['height_shift_range']),
            str(augmentation['horizontal_flip']),
            str(augmentation['vertical_flip']),
            str(augmentation['brightness_range']),
            str(augmentation['zoom_range'])
        ],
        'Mục đích': [
            'Tăng khả năng nhận dạng ở các góc khác nhau',
            'Xử lý đối tượng không ở trung tâm',
            'Xử lý đối tượng không ở trung tâm',
            'Xử lý đối tượng bị lật ngang',
            'Xử lý đối tượng bị lật dọc',
            'Xử lý điều kiện ánh sáng khác nhau',
            'Xử lý kích thước đối tượng khác nhau'
        ]
    }

    # 4. Bảng Đánh Giá Hiệu Năng (Performance Metrics)
    evaluation_metrics = calculate_metrics(history_dict)
    
    # Thêm thông tin thời gian training
    if 'training_time_minutes' in history_dict:
        start_time = datetime.fromisoformat(history_dict['training_start_time'])
        end_time = datetime.fromisoformat(history_dict['training_end_time'])
        
        evaluation_metrics.update({
            'Thời gian bắt đầu': start_time.strftime('%Y-%m-%d %H:%M:%S'),
            'Thời gian kết thúc': end_time.strftime('%Y-%m-%d %H:%M:%S'),
            'Tổng thời gian (phút)': history_dict['training_time_minutes']
        })
    
    performance_metrics = {
        'Metric': list(evaluation_metrics.keys()),
        'Giá trị': list(evaluation_metrics.values()),
        'Đánh giá': [
            'Độ chính xác tốt nhất trên tập training',
            'Độ chính xác tốt nhất trên tập validation',
            'Loss thấp nhất trên tập training',
            'Loss thấp nhất trên tập validation',
            'Epoch đạt ngưỡng hội tụ (>99%)',
            'Số epoch đã train',
            'Độ ổn định của model (std của 10 epoch cuối)',
            'Mức độ overfitting (train_acc - val_acc)',
            'Thời điểm bắt đầu quá trình training',
            'Thời điểm kết thúc quá trình training',
            'Tổng thời gian training tính bằng phút'
        ]
    }

    # 5. Bảng History Data
    history_data = {
        'Epoch': list(range(1, len(history_dict['loss']) + 1)),
        'Training Loss': history_dict['loss'],
        'Training Accuracy': history_dict['accuracy'],
        'Validation Loss': history_dict['val_loss'],
        'Validation Accuracy': history_dict['val_accuracy']
    }
    if 'lr' in history_dict:
        history_data['Learning Rate'] = history_dict['lr']

    # Create Excel writer
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    excel_file = f'training_report_{timestamp}.xlsx'
    writer = pd.ExcelWriter(excel_file, engine='openpyxl')

    # Create DataFrames
    history_df = pd.DataFrame(history_data)
    model_arch_df = pd.DataFrame(model_architecture)
    training_params_df = pd.DataFrame(training_params)
    augmentation_df = pd.DataFrame(data_augmentation)
    performance_df = pd.DataFrame(performance_metrics)

    # Write to Excel with formatting
    def write_sheet_with_formatting(writer, df, sheet_name):
        df.to_excel(writer, sheet_name=sheet_name, index=False)
        worksheet = writer.sheets[sheet_name]
        
        # Auto-adjust columns width
        for idx, col in enumerate(df.columns):
            series = df[col]
            max_len = max((
                series.astype(str).map(len).max(),
                len(str(col))
            )) + 2
            worksheet.column_dimensions[chr(65 + idx)].width = max_len

    # Write each sheet
    write_sheet_with_formatting(writer, history_df, 'Quá trình Training')
    write_sheet_with_formatting(writer, model_arch_df, 'Kiến trúc Mô hình')
    write_sheet_with_formatting(writer, training_params_df, 'Thông số Training')
    write_sheet_with_formatting(writer, augmentation_df, 'Data Augmentation')
    write_sheet_with_formatting(writer, performance_df, 'Đánh giá Hiệu năng')

    # Save the Excel file
    writer.close()

    print(f"Báo cáo đánh giá đã được lưu vào file: {excel_file}")
    return excel_file

if __name__ == "__main__":
    # Test data
    test_results = {
        "history": {
            "loss": [0.669760525226593, 0.18049705028533936],
            "accuracy": [0.625, 1.0],
            "val_loss": [0.7671955823898315, 0.6129673719406128],
            "val_accuracy": [0.5, 0.5],
            "lr": [0.001, 0.001]
        },
        "model_params": {
            "training_samples": 8,
            "validation_samples": 2,
            "num_classes": 2,
            "class_names": ["Class 1", "Class 2"],
            "class_weights": {"0": 1.0, "1": 1.0},
            "model_architecture": "MobileNetV2",
            "input_shape": [224, 224, 3],
            "num_layers": 6,
            "learning_rate": 0.001,
            "batch_size": 16,
            "epochs": 50,
            "early_stopping_patience": 15,
            "data_augmentation": {
                "rotation_range": 30,
                "width_shift_range": 0.3,
                "height_shift_range": 0.3,
                "horizontal_flip": True,
                "vertical_flip": True,
                "brightness_range": [0.8, 1.2],
                "zoom_range": 0.2
            }
        }
    }
    create_training_report(test_results["history"], test_results["model_params"]) 