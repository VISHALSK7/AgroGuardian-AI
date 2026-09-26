"""
Disease-Spread Risk Forecasting Module for Crop Diseases
=========================================================
Implementation of the epidemiological micro-climate risk model:

    R_spread(t) = sigmoid( gamma0 + gamma1 * fT(T(t)) + gamma2 * fH(H(t))
                           + gamma3 * R(t) + gamma4 * Wd(t) ) * kappa_pathogen

Where:
    - T(t): Ambient temperature (°C) at time t
    - H(t): Relative humidity (%) at time t
    - R(t): Precipitation (mm) at time t
    - Wd(t): Canopy leaf wetness duration (hours) at time t
    - fT(T): Cardinal temperature response function peaking at T_opt
            (Beta function or Triangular response)
    - fH(H): Sigmoidal humidity response saturating at high humidity
    - kappa_pathogen: Host/pathogen vulnerability scaling constant [0, 1]
    - gamma0..gamma4: Model coefficients (mechanistic prior or fitted)

Author: AgroGuardian AI Project
"""

import numpy as np
import pandas as pd
import requests
from typing import Dict, Any, Optional, Tuple, Literal
from dataclasses import dataclass, field


@dataclass
class PathogenProfile:
    """
    Biological parameters for a specific crop phytopathogen, derived
    from empirical plant pathology literature.
    """
    name: str
    scientific_name: str
    crop: str
    t_min: float         # Minimum temperature for spore germination/infection (°C)
    t_opt: float         # Optimal temperature for infection kinetics (°C)
    t_max: float         # Maximum temperature threshold (°C)
    h_mid: float = 80.0  # Relative humidity inflection point (%)
    h_k: float = 5.0     # Humidity transition smoothness factor (%)
    kappa: float = 0.90  # Host vulnerability / pathogen aggressiveness [0, 1]
    citations: str = ""
    typical_symptom_lag_days: Tuple[int, int] = (10, 14)  # Incubation lag (days)


# Standard pathological profiles established from literature
PATHOGENS = None
LITERATURE_PROFILES: Dict[str, PathogenProfile] = {
    "apple_cedar_rust": PathogenProfile(
        name="Apple Cedar Rust",
        scientific_name="Gymnosporangium juniperi-virginianae",
        crop="Apple",
        t_min=8.0,
        t_opt=20.0,
        t_max=30.0,
        h_mid=82.0,
        h_k=4.5,
        kappa=0.90,
        citations=(
            "Aldwinckle et al. (1980) Phytopathology 70(6):567-570; "
            "Yoder & Biggs, Compendium of Apple and Pear Diseases (APS Press)."
        ),
        typical_symptom_lag_days=(10, 14)
    ),
    "corn_common_rust": PathogenProfile(
        name="Corn Common Rust",
        scientific_name="Puccinia sorghi",
        crop="Corn",
        t_min=10.0,
        t_opt=21.0,
        t_max=31.0,
        h_mid=85.0,
        h_k=4.0,
        kappa=0.85,
        citations=(
            "Mahindapala (1978) Ann. Appl. Biol. 89(3):411-416; "
            "Smith (1977) Plant Dis. Reptr. 61:439-441; White, Compendium of Corn Diseases."
        ),
        typical_symptom_lag_days=(7, 12)
    ),
        "mango_anthracnose": PathogenProfile(
        name="Mango Anthracnose",
        scientific_name="Colletotrichum gloeosporioides",
        crop="Mango",
        t_min=15.0,
        t_opt=28.0,
        t_max=35.0,
        h_mid=80.0,
        h_k=4.5,
        kappa=0.90,
        citations=(
            "Fitzell and Peak (1984) Ann. Appl. Biol. 104(1):53-58; "
            "Dodd et al. (1992) Plant Pathology 41(5):568-581."
        ),
        typical_symptom_lag_days=(5, 10)
    ),
    "grape_black_rot": PathogenProfile(
        name="Grape Black Rot",
        scientific_name="Guignardia bidwellii / Phyllosticta ampelicida",
        crop="Grape",
        t_min=10.0,
        t_opt=26.5,
        t_max=32.0,
        h_mid=80.0,
        h_k=5.0,
        kappa=0.95,
        citations=(
            "Spotts (1977) Phytopathology 67(11):1378-1381; "
            "Hoffman et al. (2002) Phytopathology 92(6):597-604."
        ),
        typical_symptom_lag_days=(8, 14)
    )
}


PATHOGENS = LITERATURE_PROFILES

def beta_temperature_response(t: np.ndarray, t_min: float, t_opt: float, t_max: float) -> np.ndarray:
    """
    Beta cardinal temperature response function (Yan & Hunt, 1999; Yin et al., 1995).
    Continuous, asymmetric, peaks at 1.0 when t == t_opt, equals 0 outside [t_min, t_max].

    Formula:
        fT(T) = ((T - Tmin)/(Topt - Tmin)) * ((Tmax - T)/(Tmax - Topt))^((Tmax - Topt)/(Topt - Tmin))
    """
    t = np.asarray(t, dtype=float)
    result = np.zeros_like(t)

    valid_mask = (t > t_min) & (t < t_max)
    if not np.any(valid_mask):
        return result

    t_val = t[valid_mask]
    exponent = (t_max - t_opt) / (t_opt - t_min)

    num1 = (t_val - t_min) / (t_opt - t_min)
    num2 = np.maximum(0.0, (t_max - t_val) / (t_max - t_opt))

    resp = num1 * (num2 ** exponent)
    result[valid_mask] = np.clip(resp, 0.0, 1.0)
    return result


def triangular_temperature_response(t: np.ndarray, t_min: float, t_opt: float, t_max: float) -> np.ndarray:
    """
    Piecewise linear triangular cardinal temperature response curve.
    """
    t = np.asarray(t, dtype=float)
    result = np.zeros_like(t)

    left_mask = (t >= t_min) & (t <= t_opt)
    right_mask = (t > t_opt) & (t <= t_max)

    if t_opt > t_min:
        result[left_mask] = (t[left_mask] - t_min) / (t_opt - t_min)
    if t_max > t_opt:
        result[right_mask] = (t_max - t[right_mask]) / (t_max - t_opt)

    return np.clip(result, 0.0, 1.0)


def sigmoidal_humidity_response(h: np.ndarray, h_mid: float = 80.0, h_k: float = 5.0) -> np.ndarray:
    """
    Sigmoidal relative humidity response function:
        fH(H) = 1 / (1 + exp(-(H - h_mid) / h_k))
    Saturates toward 1.0 at high humidity (85-100%), drops near 0 below 65-70%.
    """
    h = np.asarray(h, dtype=float)
    z = np.clip(-(h - h_mid) / max(h_k, 1e-3), -30.0, 30.0)
    return 1.0 / (1.0 + np.exp(z))


class DiseaseRiskForecaster:
    """
    Micro-climatic Disease Spread Risk Forecasting Model R_spread(t).
    """

    def __init__(
        self,
        profile: PathogenProfile,
        temp_curve: Literal["beta", "triangular"] = "beta",
        gamma0: float = -4.5,
        gamma1: float = 2.5,
        gamma2: float = 2.5,
        gamma3: float = 0.15,
        gamma4: float = 0.20,
        coefficients_calibrated: bool = False,
        calibration_notes: str = "Physically-informed mechanistic prior"
    ):
        """
        Initialize the forecaster with pathogen profile and coefficients.

        Parameters:
        -----------
        profile : PathogenProfile
            Pathogen cardinal biology parameters.
        temp_curve : 'beta' | 'triangular'
            Form of the cardinal temperature response curve.
        gamma0..gamma4 : float
            Logit coefficients:
              gamma0: baseline suppression intercept
              gamma1: cardinal temperature weight
              gamma2: relative humidity weight
              gamma3: precipitation weight (per mm)
              gamma4: leaf wetness duration weight (per hour)
        coefficients_calibrated : bool
            Flags whether gamma coefficients were fitted to real historical
            labeled incidence data or remain physically informed design assumptions.
        calibration_notes : str
            Documentation on how the coefficients were obtained.
        """
        self.profile = profile
        self.temp_curve = temp_curve
        self.gamma0 = gamma0
        self.gamma1 = gamma1
        self.gamma2 = gamma2
        self.gamma3 = gamma3
        self.gamma4 = gamma4
        self.coefficients_calibrated = coefficients_calibrated
        self.calibration_notes = calibration_notes

    def compute_fT(self, temperature: np.ndarray) -> np.ndarray:
        """Compute cardinal temperature response fT(T)."""
        if self.temp_curve == "beta":
            return beta_temperature_response(
                temperature, self.profile.t_min, self.profile.t_opt, self.profile.t_max
            )
        else:
            return triangular_temperature_response(
                temperature, self.profile.t_min, self.profile.t_opt, self.profile.t_max
            )

    def compute_fH(self, humidity: np.ndarray) -> np.ndarray:
        """Compute sigmoidal humidity response fH(H)."""
        return sigmoidal_humidity_response(humidity, self.profile.h_mid, self.profile.h_k)

    def compute_risk(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Compute daily disease-spread risk time series from a DataFrame with:
            - 'temperature_2m_mean' (or 'temperature'): °C
            - 'relative_humidity_2m_mean' (or 'humidity'): %
            - 'precipitation_sum' (or 'precipitation'): mm
            - 'leaf_wetness_hours' (or 'Wd'): hours [0, 24]

        Returns:
            Copy of input DataFrame augmented with:
            ['fT', 'fH', 'logit_z', 'R_spread', 'alert_flag']
        """
        out = df.copy()

        # Flexible column resolution
        t_col = "temperature_2m_mean" if "temperature_2m_mean" in out else "temperature"
        h_col = "relative_humidity_2m_mean" if "relative_humidity_2m_mean" in out else "humidity"
        r_col = "precipitation_sum" if "precipitation_sum" in out else "precipitation"
        w_col = "leaf_wetness_hours" if "leaf_wetness_hours" in out else "Wd"

        for col, name in [(t_col, "Temperature"), (h_col, "Humidity"), (r_col, "Precipitation"), (w_col, "Leaf Wetness")]:
            if col not in out.columns:
                raise ValueError(f"Required column for {name} ('{col}') missing from DataFrame.")

        temp = out[t_col].to_numpy(dtype=float)
        hum = out[h_col].to_numpy(dtype=float)
        prec = out[r_col].to_numpy(dtype=float)
        wd = out[w_col].to_numpy(dtype=float)

        f_T = self.compute_fT(temp)
        f_H = self.compute_fH(hum)

        # Logit calculation
        z = (
            self.gamma0
            + self.gamma1 * f_T
            + self.gamma2 * f_H
            + self.gamma3 * prec
            + self.gamma4 * wd
        )

        # Clip logit to avoid overflow in exp
        z_clipped = np.clip(z, -30.0, 30.0)
        sigmoid_val = 1.0 / (1.0 + np.exp(-z_clipped))
        r_spread = sigmoid_val * self.profile.kappa

        out["fT"] = f_T
        out["fH"] = f_H
        out["logit_z"] = z
        out["R_spread"] = r_spread
        out["alert_flag"] = (r_spread >= 0.65).astype(int)

        return out

    def fit_coefficients(
        self,
        df: pd.DataFrame,
        target_col: str = "observed_severity"
    ) -> Dict[str, Any]:
        """
        Fit gamma0..gamma4 coefficients to real labeled empirical severity data
        using L-BFGS-B optimization when labeled historical field data exists.
        """
        from scipy.optimize import minimize

        t_col = "temperature_2m_mean" if "temperature_2m_mean" in df else "temperature"
        h_col = "relative_humidity_2m_mean" if "relative_humidity_2m_mean" in df else "humidity"
        r_col = "precipitation_sum" if "precipitation_sum" in df else "precipitation"
        w_col = "leaf_wetness_hours" if "leaf_wetness_hours" in df else "Wd"

        temp = df[t_col].to_numpy(dtype=float)
        hum = df[h_col].to_numpy(dtype=float)
        prec = df[r_col].to_numpy(dtype=float)
        wd = df[w_col].to_numpy(dtype=float)
        y_true = df[target_col].to_numpy(dtype=float)

        f_T = self.compute_fT(temp)
        f_H = self.compute_fH(hum)

        def loss(params):
            g0, g1, g2, g3, g4 = params
            z = g0 + g1 * f_T + g2 * f_H + g3 * prec + g4 * wd
            z_c = np.clip(z, -30.0, 30.0)
            pred = (1.0 / (1.0 + np.exp(-z_c))) * self.profile.kappa
            return np.mean((pred - y_true) ** 2)

        init_params = [self.gamma0, self.gamma1, self.gamma2, self.gamma3, self.gamma4]
        res = minimize(loss, init_params, method="L-BFGS-B")

        if res.success:
            self.gamma0, self.gamma1, self.gamma2, self.gamma3, self.gamma4 = res.x
            self.coefficients_calibrated = True
            self.calibration_notes = f"Fitted via L-BFGS-B on {len(df)} samples; final MSE={res.fun:.6f}"
            return {"success": True, "loss": float(res.fun), "coefficients": list(res.x)}
        else:
            return {"success": False, "message": res.message}


def fetch_open_meteo_weather(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str
) -> pd.DataFrame:
    """
    Fetch historical daily and hourly weather data from Open-Meteo Historical Weather API.
    Computes daily Leaf Wetness Duration (Wd) from hourly relative humidity and precipitation.

    Standard pathological definition of Leaf Wetness Duration (LWD):
    An hour is counted as wet if RH >= 90% OR precipitation > 0.1 mm
    (Sentelhas et al. 2008, Magarey et al. 2005).
    """
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "daily": [
            "temperature_2m_mean",
            "temperature_2m_max",
            "temperature_2m_min",
            "relative_humidity_2m_mean",
            "precipitation_sum"
        ],
        "hourly": [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation"
        ],
        "timezone": "auto"
    }

    resp = requests.get(url, params=params, timeout=25)
    resp.raise_for_status()
    data = resp.json()

    # 1. Process daily data
    daily_df = pd.DataFrame(data["daily"])
    daily_df["date"] = pd.to_datetime(daily_df["time"])

    # 2. Process hourly data to derive daily leaf wetness duration (Wd)
    hourly_df = pd.DataFrame(data["hourly"])
    hourly_df["time"] = pd.to_datetime(hourly_df["time"])
    hourly_df["date"] = hourly_df["time"].dt.floor("D")

    # Hourly wetness criterion: RH >= 90% or precipitation > 0.1 mm
    hourly_df["is_wet"] = (
        (hourly_df["relative_humidity_2m"] >= 90.0) |
        (hourly_df["precipitation"] > 0.1)
    ).astype(int)

    # Aggregate daily leaf wetness hours (0 - 24 hours)
    daily_lwd = hourly_df.groupby("date")["is_wet"].sum().reset_index()
    daily_lwd.rename(columns={"is_wet": "leaf_wetness_hours"}, inplace=True)

    # Merge daily weather with LWD
    merged_df = pd.merge(daily_df, daily_lwd, on="date", how="left")
    merged_df["leaf_wetness_hours"] = merged_df["leaf_wetness_hours"].fillna(0.0)

    return merged_df


def calculate_single_point_risk(
    crop: str,
    temp_c: float,
    humidity_pct: float,
    precip_mm: float,
    wetness_hours: Optional[float] = None
) -> Dict[str, Any]:
    """
    Computes single-point Equation (8) disease-spread risk index:
    R_spread(t) = sigmoid(gamma0 + gamma1*fT(T) + gamma2*fH(H) + gamma3*R + gamma4*Wd) * kappa_pathogen
    """
    crop_map = {
        "apple": "apple_cedar_rust",
        "corn": "corn_common_rust",
        "grape": "grape_black_rot",
        "mango": "mango_anthracnose"
    }
    key = crop_map.get(crop.lower().strip(), "corn_common_rust")
    profile = LITERATURE_PROFILES.get(key, LITERATURE_PROFILES["corn_common_rust"])
    forecaster = DiseaseRiskForecaster(profile=profile, temp_curve="beta")

    if wetness_hours is None:
        wetness_hours = 5.0 if (humidity_pct >= 80.0 or precip_mm > 0.5) else (2.0 if humidity_pct >= 70.0 else 0.0)

    df = pd.DataFrame([{
        "temperature": temp_c,
        "humidity": humidity_pct,
        "precipitation": precip_mm,
        "Wd": wetness_hours
    }])

    res_df = forecaster.compute_risk(df)
    row = res_df.iloc[0]

    risk_score = float(row["R_spread"])
    risk_pct = int(np.clip(risk_score * 100.0, 5.0, 95.0))

    risk_level = "Low"
    if risk_pct >= 75: risk_level = "Critical"
    elif risk_pct >= 50: risk_level = "High"
    elif risk_pct >= 25: risk_level = "Medium"

    return {
        "crop": crop,
        "pathogen_key": key,
        "pathogen_name": profile.name,
        "scientific_name": profile.scientific_name,
        "risk_score_raw": risk_score,
        "risk_percent": risk_pct,
        "risk_level": risk_level,
        "f_T": round(float(row["fT"]), 4),
        "f_H": round(float(row["fH"]), 4),
        "W_d": round(float(wetness_hours), 2),
        "kappa_pathogen": profile.kappa,
        "logit_z": round(float(row["logit_z"]), 4),
        "alert_triggered": bool(row["alert_flag"])
    }
