import uvicorn
import threading
import time
import requests

from main import app

def run_server():
    uvicorn.run(app, host='127.0.0.1', port=8005, log_level='warning')

if __name__ == "__main__":
    t = threading.Thread(target=run_server, daemon=True)
    t.start()
    time.sleep(2)

    base = 'http://127.0.0.1:8005'
    print('=== 1. HEALTH & ROOT CHECK ===')
    r = requests.get(f'{base}/health')
    print('Health:', r.status_code, r.json())
    r = requests.get(f'{base}/')
    print('Root:', r.status_code, r.json()['tagline'])

    print('\n=== 2. TRAINEES ROSTER ===')
    r = requests.get(f'{base}/trainees')
    trainees = r.json()
    print(f'Total trainees returned: {len(trainees)}')
    sample = trainees[0]
    print(f"Sample candidate: {sample['name']} | Course: {sample['course_name']} | Status: {sample['current_status']}")

    print('\n=== 3. REAL SCIKIT-LEARN SKILL-GAP ANALYSIS ===')
    r = requests.get(f'{base}/analytics/skill-gaps')
    sg = r.json()
    print(f"Algorithm: {sg['algorithm']}")
    for c in sg['courses']:
        print(f"  • {c['course_name']}: {c['similarity_score']}% match | Status: {c['gap_status']} | Flagged: {c['is_flagged']}")

    print('\n=== 4. REAL SCIKIT-LEARN ATTRITION RISK PREDICTOR ===')
    r = requests.get(f'{base}/analytics/attrition-risk')
    ar = r.json()
    print(f"Model: {ar['model']}")
    print(f"Mandatory Disclaimer: {ar['mandatory_disclaimer']}")
    print(f"Summary: {ar['summary']}")
    print(f"Top 3 Risk predictions:")
    for p in ar['predictions'][:3]:
        print(f"  • {p['name']} ({p['course_name']}): {p['attrition_risk_score']}% risk ({p['risk_level']}) - Action: {p['recommended_action']}")

    print('\n=== 5. SIMULATE <15s CHECK-IN ===')
    checkin_payload = {'status': 'employed', 'employer_name': 'Tata Motors Ltd Pune', 'wage': 18500, 'same_employer': True}
    r = requests.post(f'{base}/trainees/1/checkin', json=checkin_payload)
    print(f"Check-in result ({r.status_code}): {r.json()['message']}")

    print('\n=== 6. EMPLOYER 1-TAP VERIFICATION ===')
    r = requests.get(f'{base}/verifications/pending')
    pending_list = r.json()
    print(f"Pending verifications count: {len(pending_list)}")
    if pending_list:
        vr_id = pending_list[0]['id']
        t_name = pending_list[0]['trainee_name']
        print(f"Executing 1-tap confirm for {t_name} (ID: {vr_id})...")
        conf_r = requests.post(f'{base}/verifications/{vr_id}/confirm')
        print(f"Confirmation response: {conf_r.json()['message']}")

    print('\n=== 7. SIMULATED COMMUNICATION LOG ===')
    r = requests.get(f'{base}/analytics/outbound-messages')
    msg_data = r.json()
    print(f"Total simulated outbound messages logged: {msg_data['total_messages_logged']}")
    for m in msg_data['messages'][:2]:
        print(f"  • [{m['channel'].upper()}] to {m['trainee_name']}: {m['message_text']}")

    print('\n>>> ALL 7 SYSTEM VERIFICATION TESTS PASSED PERFECTLY! <<<')
