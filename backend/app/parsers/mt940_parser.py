import re
from typing import List, Dict


def parse_mt940(content: str) -> List[Dict]:
    """
    Parses a simplified MT940 string and extracts transactions.

    Args:
        content (str): The full MT940 file as a string.

    Returns:
        List[Dict]: A list of transaction dictionaries.
    """

    transactions = []
    lines = content.splitlines()
    current_transaction = {}
    
    for line in lines:
        line = line.strip()
        if line.startswith(":61:"):
            match = re.match(r":61:(\d{6})(\d{4})?([CD])([\d,]+)", line)
            if match:
                value_date = match.group(1)
                entry_date = match.group(2) or ""
                dc_mark = match.group(3)
                amount = match.group(4).replace(",", ".")
                current_transaction = {
                    "value_date": value_date,
                    "entry_date": entry_date,
                    "type": "credit" if dc_mark == "C" else "debit",
                    "amount": float(amount),
                    "description": ""
                }
                transactions.append(current_transaction)

        elif line.startswith(":86:") and transactions:
            transactions[-1]["description"] = line[4:].strip()

    return transactions
