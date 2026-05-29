"""
Create students.xlsx and staffs.xlsx Excel login database files.
Run this script once to generate the initial Excel sheets.
You can edit these files manually in Excel to add/remove users.
"""
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

def style_header(ws, headers):
    """Apply premium styling to header row."""
    header_font = Font(name='Calibri', bold=True, size=12, color='FFFFFF')
    header_fill = PatternFill(start_color='1E3A5F', end_color='1E3A5F', fill_type='solid')
    thin_border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    
    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = thin_border
    
    # Auto-fit column widths
    for col_num, header in enumerate(headers, 1):
        ws.column_dimensions[openpyxl.utils.get_column_letter(col_num)].width = max(len(header) + 6, 18)


def create_students_xlsx():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Students"
    
    headers = ["Student ID", "Register Number", "Full Name", "Department", "Year", "Section", "Email", "Password"]
    style_header(ws, headers)
    
    # Sample student data
    students = [
        ["ST001", "23BME101", "Vishnu Priya", "Biomedical", "3rd", "A", "vishnu@gmail.com", "123456"],
        ["ST002", "23CSE205", "Arjun Sharma", "Computer Science", "3rd", "B", "arjun.s@student.edu", "arjun@123"],
        ["ST003", "22ECE110", "Priya Patel", "Electronics & Communication", "4th", "A", "priya.p@student.edu", "priya2024"],
        ["ST004", "24IT302", "Sneha Reddy", "Information Technology", "2nd", "A", "sneha.r@student.edu", "sneha@456"],
        ["ST005", "23ME150", "Rahul Krishnan", "Mechanical Engineering", "3rd", "B", "rahul.k@student.edu", "rahul789"],
    ]
    
    thin_border = Border(
        left=Side(style='thin'), right=Side(style='thin'),
        top=Side(style='thin'), bottom=Side(style='thin')
    )
    
    for row_num, student in enumerate(students, 2):
        for col_num, value in enumerate(student, 1):
            cell = ws.cell(row=row_num, column=col_num, value=value)
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.border = thin_border
    
    wb.save("students.xlsx")
    print("✅ students.xlsx created successfully with", len(students), "students")


def create_staffs_xlsx():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Staff"
    
    headers = ["Staff ID", "Full Name", "Department", "Official Email", "Password", "Role"]
    style_header(ws, headers)
    
    # Sample staff data
    staffs = [
        ["SF001", "Dr. Sarah Jenkins", "Computer Science", "sjenkins@college.edu", "admin123", "Head of Department"],
        ["SF002", "Prof. Rajesh Kumar", "Electronics & Communication", "rkumar@college.edu", "rajesh@456", "Placement Coordinator"],
        ["SF003", "Dr. Emily Carter", "Information Technology", "ecarter@college.edu", "emily789", "Assistant Professor"],
        ["SF004", "Dr. Kumar", "Placement", "placement@college.edu", "admin123", "Admin"],
    ]
    
    thin_border = Border(
        left=Side(style='thin'), right=Side(style='thin'),
        top=Side(style='thin'), bottom=Side(style='thin')
    )
    
    for row_num, staff in enumerate(staffs, 2):
        for col_num, value in enumerate(staff, 1):
            cell = ws.cell(row=row_num, column=col_num, value=value)
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.border = thin_border
    
    wb.save("staffs.xlsx")
    print("✅ staffs.xlsx created successfully with", len(staffs), "staff members")


if __name__ == "__main__":
    create_students_xlsx()
    create_staffs_xlsx()
    print("\n📂 Both Excel files have been created in the project directory.")
    print("   You can open and edit them in Excel to add/remove users.")
