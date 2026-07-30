import re

class AITackShield:
    """
    Modul Keamanan AI (Aittack Integration) untuk Wasdal.
    Bertugas melakukan sanitasi PII (Personal Identifiable Information)
    dan mendeteksi percobaan Prompt Injection sebelum teks dikirim ke LLM.
    """
    
    # Deteksi NIK (16 digit angka berurutan)
    NIK_PATTERN = re.compile(r'\b\d{16}\b')
    
    # Deteksi kata kunci yang sering digunakan untuk Prompt Injection / Jailbreak
    INJECTION_KEYWORDS = [
        "ignore all previous instructions",
        "forget all previous instructions",
        "disregard all previous instructions",
        "system prompt",
        "you are now",
        "act as",
        "jailbreak",
        "dan mode", # Do Anything Now
        "bocorkan data",
        "tampilkan prompt",
    ]

    @classmethod
    def sanitize(cls, text: str) -> tuple[str, bool]:
        """
        Menyensor NIK dan mendeteksi Prompt Injection.
        Returns: (sanitized_text, is_injection_detected)
        """
        if not text:
            return text, False

        # 1. Masking NIK (PII Sanitization)
        # Ubah 12 digit pertama menjadi *, sisa 4 digit terakhir tetap
        sanitized_text = cls.NIK_PATTERN.sub(
            lambda m: '*' * 12 + m.group(0)[-4:], 
            text
        )

        # 2. Deteksi Prompt Injection
        text_lower = sanitized_text.lower()
        is_injection = False
        for keyword in cls.INJECTION_KEYWORDS:
            if keyword in text_lower:
                is_injection = True
                break

        return sanitized_text, is_injection
