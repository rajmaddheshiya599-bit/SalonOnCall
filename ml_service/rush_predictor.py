import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import joblib
import os

class RushPredictor:
    def __init__(self, model_path='rush_model.joblib'):
        self.model_path = model_path
        self.model = None
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)

    def generate_synthetic_data(self, n_samples=200):
        # Columns: day_of_week (0-6), hour_of_day (9-21), is_holiday (0-1), customer_count
        np.random.seed(42)
        days = np.random.randint(0, 7, n_samples)
        hours = np.random.randint(9, 21, n_samples)
        holidays = np.random.choice([0, 1], n_samples, p=[0.9, 0.1])
        
        # Base count + factor for weekends + factor for peak hours (11-13, 17-19) + factor for holidays
        base_count = 2
        weekend_factor = np.where(days >= 5, 3, 0)
        peak_hour_factor = np.where(((hours >= 11) & (hours <= 13)) | ((hours >= 17) & (hours <= 19)), 4, 0)
        holiday_factor = holidays * 5
        noise = np.random.randint(0, 3, n_samples)
        
        counts = base_count + weekend_factor + peak_hour_factor + holiday_factor + noise
        
        df = pd.DataFrame({
            'day_of_week': days,
            'hour_of_day': hours,
            'is_holiday': holidays,
            'customer_count': counts
        })
        df.to_csv('bookings_history.csv', index=False)
        return df

    def train(self):
        if not os.path.exists('bookings_history.csv'):
            self.generate_synthetic_data()
        
        df = pd.read_csv('bookings_history.csv')
        X = df[['day_of_week', 'hour_of_day', 'is_holiday']]
        y = df['customer_count']
        
        self.model = LinearRegression()
        self.model.fit(X, y)
        joblib.dump(self.model, self.model_path)
        return "Model trained successfully"

    def predict(self, day, hour, is_holiday=0):
        if self.model is None:
            self.train()
        
        X_new = pd.DataFrame([[day, hour, is_holiday]], columns=['day_of_week', 'hour_of_day', 'is_holiday'])
        prediction = self.model.predict(X_new)[0]
        return max(0, round(prediction, 1))
