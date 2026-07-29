import asyncio
import random

async def fetch_lapor_complaints():
    """
    Simulates fetching recent complaints from SP4N LAPOR! API for Tangerang Selatan.
    Returns a list of complaint texts.
    """
    await asyncio.sleep(2) # Simulate network delay
    
    # Realistic simulated complaints from Tangsel
    simulated_complaints = [
        "Lapor Pak, jalan raya Serpong di depan WTC Matahari berlubang sangat dalam dan membahayakan pengendara motor, apalagi kalau malam dan hujan tertutup genangan air. Mohon segera diperbaiki.",
        "Tumpukan sampah di pinggir jalan raya Jombang, Ciputat belum diangkut sudah 3 hari, baunya sangat menyengat dan mengganggu warga sekitar.",
        "Lampu penerangan jalan umum (PJU) di sepanjang jalan Bintaro sektor 7 mati total, jalanan jadi sangat gelap dan rawan kejahatan. Tolong dinas terkait segera turun tangan.",
        "Ada galian kabel utilitas di trotoar jalan Pamulang Permai yang dibiarkan terbuka berminggu-minggu tanpa penutup, sangat berbahaya bagi pejalan kaki khususnya anak sekolah."
    ]
    
    # Randomly pick 1 to 2 complaints to simulate real-time incoming data
    num_complaints = random.randint(1, 2)
    return random.sample(simulated_complaints, num_complaints)
