# Budget Buckets — Project Bible

## Overview

Budget Buckets is a private, family-use monthly budgeting web app. It replaces a shared Google Spreadsheet with a visual, mobile-friendly interface that makes it easy to see how much is left in each spending category and to enter transactions on the go.

It is not a full financial management tool. It does not track bills, income, or investments. It focuses entirely on discretionary monthly spending categories.

---

## Users

- Private household use only (Luke Martin + family members)
- Not a public app — no open registration
- Admin (Luke) creates accounts for family members
- All users share one household budget

---

## Authentication

- Firebase Authentication (email + password)
- Individual accounts per family member
- iPhone Face ID works automatically via iCloud Keychain saving credentials
- Admin screen for creating and managing user accounts

---

## Budget Structure

- Budget is monthly — a new budget is created each month
- Categories are custom each month: some repeat, some are one-time
- Each category has a name and a budgeted dollar amount
- Budget is set up by importing a CSV exported from Google Sheets
- CSV import reads category names and amounts from the existing spreadsheet format
- Categories can also be added or edited manually within the app

---

## Transactions

- Each transaction records: amount, category
- Transactions can be edited and deleted
- No date or user tracking at launch (planned for a future phase)
- Transactions are entered from the main screen or from inside a category

---

## Screens

### Main Screen
- Lists all budget categories for the current month
- Each category shows:
  - Category name
  - Dollar amount remaining (budgeted minus spent)
  - Progress bar: green (plenty left), yellow (getting low), red (near/over budget)
- "Add Transaction" button accessible from this screen
- Tap a category to open the Category Detail screen

### Category Detail Screen
- Donut chart showing spent vs. remaining
- Dollar amounts (spent, remaining, total budget)
- List of all transactions in this category
- Edit and delete controls on each transaction
- "Add Transaction" button

### Add Transaction
- Simple form: amount + category selector
- Accessible from main screen and category detail
- Category is pre-selected when accessed from Category Detail

### Month Setup
- Triggered at the start of each month
- Option 1: Upload a CSV exported from Google Sheets
- Option 2: Manually add/edit categories
- Previous month is archived (viewable in future phase)

### Admin Screen
- Create user accounts (email + password)
- Manage existing users
- Hidden from standard navigation — admin only

---

## Visual Design

- Mobile-first, designed for iPhone 17
- PWA — installable from Safari to iPhone home screen, runs full-screen
- Progress bars use color coding:
  - Green: 50%+ remaining
  - Yellow: 25–50% remaining
  - Red: under 25% remaining
- Clean, minimal UI — easy to read at a glance

---

## Out of Scope (Launch)

- Bill tracking
- Income tracking
- Budget rollover between months
- Recurring/auto-entered transactions
- Historical charts or multi-month reports
- Per-user spending breakdowns
- Date field on transactions
- Push notifications
