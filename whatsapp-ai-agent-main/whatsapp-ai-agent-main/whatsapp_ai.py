whatsapp_ai.pyimport time
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_reply(message):
    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=message,
            max_tokens=150
        )
        return response.choices[0].text.strip()
    except Exception as e:
        print("GPT error:", e)
        return "Sorry, I couldn't generate a reply."

profile_path = os.path.join(os.getcwd(), "chrome_profile")
os.makedirs(profile_path, exist_ok=True)

def init_driver():
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={profile_path}")
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-infobars")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--disable-software-rasterizer")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )
    return driver

driver = init_driver()
driver.get("https://web.whatsapp.com")
print("WhatsApp Web opened! Scan QR if first time.")
time.sleep(15)

def get_last_message():
    try:
        messages = driver.find_elements(By.CSS_SELECTOR, "div.copyable-text span.selectable-text")
        if messages:
            return messages[-1].text
        return ""
    except Exception as e:
        print("Error getting last message:", e)
        return ""

def send_message(msg):
    try:
        input_box = driver.find_element(By.XPATH, '//div[@contenteditable="true"][@data-tab="10"]')
        input_box.send_keys(msg)
        input_box.send_keys("\n")
    except Exception as e:
        print("Error sending message:", e)

print("AI Agent Ready! Open a chat and it will reply to new messages.")
last_seen = ""

while True:
    try:
        msg = get_last_message()
        if msg and msg != last_seen:
            print("New message detected:", msg)
            reply = generate_reply(msg)
            send_message(reply)
            last_seen = msg
        time.sleep(2)
    except Exception as e:
        print("Loop error:", e)
        try:
            driver.quit()
        except:
            pass
        print("Reinitializing browser...")
        driver = init_driver()
        driver.get("https://web.whatsapp.com")
        time.sleep(15)
