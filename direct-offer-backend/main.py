from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS offers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            listing_address TEXT,
            buyer_name TEXT,
            offer_price REAL,
            earnest_money REAL,
            financing_type TEXT,
            closing_date TEXT,
            contingencies TEXT,
            status TEXT DEFAULT 'Pending'
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class Property(BaseModel):
    address: str
    price: float

class OfferSubmission(BaseModel):
    listingAddress: str
    buyerName: str
    offerPrice: float
    earnestMoney: float
    financingType: str
    closingDate: str
    contingencies: str

@app.get("/")
async def root():
    return {"message": "Backend is running and CORS is configured!"}

@app.post("/list-property")
async def list_property(property: Property):
    standard_comm = property.price * 0.06
    direct_offer_fee = property.price * 0.03
    savings = standard_comm - direct_offer_fee
    
    conn = sqlite3.connect("listings.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO listings (address, price, savings) VALUES (?, ?, ?)",
        (property.address, property.price, savings)
    )
    conn.commit()
    conn.close()
    
    return {
        "address": property.address,
        "price": property.price,
        "standard_comm": f"{standard_comm:,.2f}",
        "direct_offer_fee": f"{direct_offer_fee:,.2f}",
        "savings": f"{savings:,.2f}",
        "net_proceeds": f"{property.price - direct_offer_fee:,.2f}"
    }

@app.get("/recent-listings")
async def get_listings():
    conn = sqlite3.connect("listings.db")
    cursor = conn.cursor()
    cursor.execute("SELECT address, price, savings FROM listings ORDER BY id DESC")
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

@app.post("/submit-offer")
async def submit_offer(offer: OfferSubmission):
    conn = sqlite3.connect("listings.db")
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO offers (listing_address, buyer_name, offer_price, earnest_money, financing_type, closing_date, contingencies)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (offer.listingAddress, offer.buyerName, offer.offerPrice, offer.earnestMoney, offer.financingType, offer.closingDate, offer.contingencies))
    conn.commit()
    conn.close()
    return {"message": "Offer submitted successfully!"}

@app.get("/offers/{address}")
async def get_offers(address: str):
    conn = sqlite3.connect("listings.db")
    cursor = conn.cursor()
    cursor.execute("SELECT buyer_name, offer_price, financing_type, closing_date, status FROM offers WHERE listing_address = ?", (address,))
    rows = cursor.fetchall()
    conn.close()
    return [{"buyerName": r[0], "offerPrice": r[1], "financingType": r[2], "closingDate": r[3], "status": r[4]} for r in rows]