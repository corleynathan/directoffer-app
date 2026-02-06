from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE SETUP ---
def init_db():
    conn = sqlite3.connect("listings.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            address TEXT,
            price REAL,
            savings REAL
        )
    ''')
    conn.commit()
    conn.close()

init_db() # Run this when the app starts

class Property(BaseModel):
    address: str
    price: float

@app.post("/list-property")
async def list_property(property: Property):
    standard_comm = property.price * 0.06
    direct_offer_fee = property.price * 0.03
    savings = standard_comm - direct_offer_fee
    
    # --- SAVE TO DATABASE ---
    conn = sqlite3.connect("listings.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO listings (address, price, savings) VALUES (?, ?, ?)",
        (property.address, property.price, savings)
    )
    conn.commit()
    conn.close()
    
    return {
        "message": f"Listing for {property.address} saved to database!",
        "standard_comm": f"{standard_comm:,.2f}",
        "direct_offer_fee": f"{direct_offer_fee:,.2f}",
        "savings": f"{savings:,.2f}",
        "net_proceeds": f"{property.price - direct_offer_fee:,.2f}"
    }

# New "Get History" Route
@app.get("/recent-listings")
async def get_listings():
    conn = sqlite3.connect("listings.db")
    cursor = conn.cursor()
    cursor.execute("SELECT address, price, savings FROM listings ORDER BY id DESC LIMIT 5")
    rows = cursor.fetchall()
    conn.close()
    
    return [{"address": r[0], "price": r[1], "savings": r[2]} for r in rows]

@app.delete("/delete-listing/{address}")
async def delete_listing(address: str):
    conn = sqlite3.connect("listings.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM listings WHERE address = ?", (address,))
    conn.commit()
    conn.close()
    return {"message": f"Deleted {address}"}