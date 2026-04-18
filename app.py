import streamlit as st
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

st.set_page_config(page_title="IntelliCrowd AI", layout="wide")

st.title("🎤 IntelliCrowd AI – Smart Event Coordination")
st.caption("AI-assisted insights | No autonomous control | Privacy-first")

# Simulated sensor data (no CSV files needed)
def get_sensor_data():
    zones = ["🎸 Stage", "🍔 Food Court", "🚪 Gate A", "🚪 Gate B", "👕 Merchandise", "🚻 Restrooms"]
    densities = np.random.randint(20, 96, size=len(zones))
    wait_times = (densities / 20).astype(int)
    
    # AI prediction model
    model = LinearRegression()
    model.fit(np.array([20, 40, 60, 80, 95]).reshape(-1, 1), 
              np.array([25, 50, 75, 90, 98]))
    
    predicted_10min = model.predict(np.array(densities).reshape(-1, 1))
    
    return pd.DataFrame({
        "Zone": zones,
        "Current Density (%)": densities,
        "Current Wait (min)": wait_times,
        "Predicted Density (10 min)": predicted_10min.round(1)
    })

df = get_sensor_data()

# Display metrics
col1, col2, col3 = st.columns(3)
with col1:
    st.metric("Total Zones", len(df))
with col2:
    avg_density = df["Current Density (%)"].mean()
    st.metric("Avg Crowd Density", f"{avg_density:.0f}%")
with col3:
    crowded_zones = len(df[df["Current Density (%)"] > 70])
    st.metric("Overcrowded Zones", crowded_zones)

# Live data display
st.subheader("📍 Live Crowd Status")
st.dataframe(df, use_container_width=True)

# AI Alerts
st.subheader("🚨 AI-Powered Alerts")
high_density = df[df["Current Density (%)"] > 75]
if len(high_density) > 0:
    for _, row in high_density.iterrows():
        st.warning(f"⚠️ {row['Zone']}: {row['Current Density (%)']}% full → {row['Current Wait (min)']} min wait")
        best_zone = df.loc[df["Current Density (%)"].idxmin(), "Zone"]
        st.info(f"💡 AI Suggestion: Consider moving toward {best_zone}")
else:
    st.success("✅ All zones operating smoothly")

# Smart navigation
st.subheader("📍 Smart Navigation")
user_location = st.selectbox("Where are you right now?", df["Zone"].tolist())

if user_location:
    user_density = df[df["Zone"] == user_location]["Current Density (%)"].values[0]
    if user_density > 70:
        alternatives = df[df["Current Density (%)"] < 50]["Zone"].tolist()
        if alternatives:
            st.info(f"🚶 High congestion. AI suggests: {', '.join(alternatives[:2])}")
        else:
            st.warning("⚠️ All zones crowded. Consider waiting.")
    else:
        st.success(f"✅ Good spot! Wait time ~{user_density/20:.0f} minutes")

# Refresh button
if st.button("🔄 Refresh Data"):
    st.cache_data.clear()
    st.rerun()

st.divider()
st.caption("🔒 Privacy: Location data is anonymized, ephemeral, and requires user opt-in")
