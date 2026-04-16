# **Web Based Yogurt Factory Management System for** **New PUBUDU Yogurt factory, Matara**

#### By Sanduni Pandipperuma IM/2021/017

##### A report submitted in partial fulfillment of the requirements for the degree of Bachelor of Science Honors in Management and Information Technology (B. Sc.IT)

**Name of the Supervisor:**


**Dr. Thareendhra Keerthi Wijayasiriwardhane**


Department of Industrial Management


Faculty of Science


University of Kelaniya


Sri Lanka


2025/07/07


### Declaration

I hereby certify that this project and all the artifacts associated with it is my work and it has not
been submitted before nor is currently being submitted for any other degree program.


Full name of the student: Sanduni Bimasha Pandipperuma


Student No: IM/2021/017


Signature of the Student: ……                      Date: 2025/07/07


Name of the Supervisor(s): Dr. Thareendhra Keerthi Wijayasiriwardhane


Signature of the Supervisor: ……………………………… Date: ………………………….


i


### Acknowledge

I am sincerely grateful to all those who have contributed to the successful completion of this
report on the Yogurt Factory Management System. This project would not have been possible
without the guidance, assistance, and encouragement of many individuals.


First of all, I would like to express my heartfelt thanks to my Project Supervisor, Dr. Thareendhra
Keerthi Wijayasiriwardhane, for his dedicated support and expert guidance throughout this
project. His constructive feedback and insightful advice have been invaluable at every stage.


I also wish to extend my appreciation to Mr. Dinesh Asanka, the Project Coordinator, for his
early guidance and for providing a clear framework to initiate this project. His input has been
crucial in aligning the project's objectives.


I am deeply thankful to Mr. Pubudu Dasanayake, the client of this project, for his willingness to
share essential information and for offering ongoing support. His cooperation ensured that the
system addresses the practical challenges of yogurt factory operations effectively.


Special thanks are due to the staff members and the panel of reviewers for their thoughtful
feedback and suggestions during the presentation sessions. Their perspectives have greatly
enhanced the overall quality of the project.


I am forever grateful to my family for their unconditional support and encouragement throughout
this journey. Their belief in my abilities has been a constant source of motivation.


Finally, I would like to thank my friends for their encouragement and thoughtful insights, which
have played a vital role in the development and completion of this project.


To everyone who supported me during this process, I extend my deepest gratitude. Your
contributions are deeply valued and appreciated.


ii


### Abstract

The existing manual processes in yogurt factory management present several inefficiencies,
including time-consuming inventory tracking, inconvenient order handling, and limited
communication among managers, customers, and suppliers. This report outlines the development
of a comprehensive Yogurt Factory Management System designed to address these challenges by
introducing automation and streamlining critical workflows.


The primary objectives of this system are to enhance inventory management, simplify order
processing, and improve communication among stakeholders. The proposed solution aims to
reduce operational delays, minimize errors, and increase overall efficiency in factory operations.


Key features of the system include automated stock level monitoring, real-time order tracking,
and detailed report generation for sales, inventory, and customer interactions. Customers can
place orders online, while suppliers and managers can manage order fulfillment seamlessly
through the platform. The system also incorporates functionalities for managing customer and
supplier registrations, returns, and refunds with ease.


To ensure accessibility and usability, the system provides a user-friendly interface tailored to the
needs of managers, suppliers, and customers. Notifications, data export options, and role-based
access control further enhance the system's functionality.


This report discusses the limitations of the current manual processes, the functional capabilities
of the proposed system, and its anticipated impact on streamlining yogurt factory operations. The
implementation of this system is expected to modernize factory management, optimize resource
utilization, and support business growth.


iii


### Table of Contents

Declaration .................................................................................................................................... i


Acknowledge ................................................................................................................................ ii


Abstract ...................................................................................................................................... iii


List of Figures ............................................................................................................................... x


List of Tables ............................................................................................................................. xiii


Chapter 1 ...................................................................................................................................... 1


1.1 Introduction ......................................................................................................................... 1


1.2 Description of the Business .................................................................................................... 2


1.3 Business Process .................................................................................................................. 3


1.4 Existing System – Problems and Weaknesses ........................................................................... 4


1.5 Aims and Objectives ............................................................................................................. 4


1.6 Scope of the Project .............................................................................................................. 6


1.7 Project Feasibility ................................................................................................................. 7


1.8 Organization of the Report ..................................................................................................... 8


1.9 Summary ............................................................................................................................. 8


Chapter 2 ...................................................................................................................................... 9


2.1 Introduction ....................................................................................................................... 10


2.2 User Stories for Existing System .......................................................................................... 10


2.2.1 Manager User Stories: ................................................................................................... 10


2.2.2 Customer User Stories: .................................................................................................. 12


2.2.3 Supplier User Stories: ................................................................................................... 13


2.3 Use Case Diagram for Existing System ................................................................................. 14


2.4 Use Case Description for Existing System ............................................................................. 15


2.4.1 Use Case Description for Register .................................................................................. 15


2.4.2 Use Case Description for Place the Order (Supplier) ......................................................... 15


2.4.3 Use Case Description for Receive the Order from Customer .............................................. 16


2.4.4 Use Case Description for Manage Inventory .................................................................... 17


2.2.5 Use Case Description for Send Invoice ............................................................................ 17


2.4.6 Use Case Description for Request Returns ....................................................................... 18


2.5 Activity Diagrams for Existing System .................................................................................. 19


2.5.1 Activity diagram for Register ......................................................................................... 19


2.5.2 Activity Diagram for Place the Order (Supplier) ............................................................... 20


iv


2.5.3 Activity Diagram for Receive Orders from Customer ........................................................ 21


2.5.4 Activity Diagram for Inventory Management ................................................................... 22


2.5.5 Activity Diagram for Send Invoice.................................................................................. 23


2.5.6 Activity Diagram for Request Returns ............................................................................. 24


2.6 Software Requirements Specification .................................................................................... 25


2.6.1 Functional Requirements ............................................................................................... 25


2.6.2 Non-functional Requirements ........................................................................................ 27


2.7 Business System Option (BSO) ............................................................................................ 28


2.7.1 BSO 1: Basic System with Essential Features .................................................................. 28


2.7.2 BSO 2: Intermediate System with Additional Automation .................................................. 30


2.7.3 BSO 3: Advanced System with Decision-Making Support ................................................. 32


2.8 BSO Analysis and Requirements Evaluation .......................................................................... 34


2.8.1 BSO vs Functional Requirements ................................................................................... 34


2.8.2 BSO vs Non-Functional Requirements ............................................................................ 36


2.9 Selected BSO with Justification ............................................................................................ 36


2.10 Summary ......................................................................................................................... 37


Chapter 3 .................................................................................................................................... 38


3.1 Introduction ....................................................................................................................... 39


3.2 Software Requirements Satisfied by the Selected BSO ............................................................ 39


3.2.1 Functional Requirements ............................................................................................... 39


3.2.2 Non-Functional Requirements ........................................................................................ 41


3.3 Use Case Diagram for Proposed System ................................................................................ 42


3.4 Use Case Description for Proposed System ............................................................................ 43


3.4.1 Use Case Description for Register .................................................................................. 43


3.4.2 Use case Description for Login ...................................................................................... 44


3.4.3 Use case Description for Update Profile .......................................................................... 44


3.4.4 Use case Description for Report Generation ..................................................................... 45


3.4.5 Use case Description for Manage Product Details ............................................................. 45


3.4.6 Use case Description for Manage Orders ......................................................................... 46


3.4.7 Use case Description for Customer Request Returns ......................................................... 47


3.4.8 Use case Description for Manager Request Returns from Supplier ...................................... 47


3.4.9 Use case Description for Receive the Order ..................................................................... 48


3.4.10 Use case Description for Manage Inventory ................................................................... 49


v


3.4.11 Use case Description for Place the Order ....................................................................... 49


3.4.12 Use case Description for Track Order ............................................................................ 50


3.4.13 Use case Description for Add Customer/Supplier Feedback or Complaints ........................ 50


3.4.14 Use case Description for Prepare Invoice ....................................................................... 51


3.5 Activity Diagrams for Proposed System ................................................................................ 52


3.5.1 Activity Diagram for Register ........................................................................................ 52


3.5.2 Activity Diagram for Login ............................................................................................ 53


3.5.3 Activity Diagram for Update Profile ............................................................................... 54


3.5.4 Activity Diagram for Report generation ........................................................................... 55


3.5.5 Activity Diagram for Manage Product Details .................................................................. 56


3.5.6 Activity Diagram for Manage Orders .............................................................................. 57


3.5.7 Activity Diagram for Manage Inventory .......................................................................... 58


3.5.8 Activity Diagram for Request Return (Supplier) ............................................................... 59


3.5.9 Activity Diagram for Request Return (Customer) ............................................................. 60


3.5.10 Activity Diagram for Receive the Order (Customer) ........................................................ 61


3.5.11 Activity Diagram for Place the Order (Supplier) ............................................................. 62


3.5.12 Activity Diagram for Track Order ................................................................................. 63


3.5.13 Activity Diagram for Add Compliments & Complaints .................................................... 64


3.5.14 Activity Diagram for Prepare Invoice ............................................................................ 65


3.6 Class Diagram for Proposed System ..................................................................................... 66


3.6.1 Entity Class Diagram .................................................................................................... 66


3.6.2 Interface Class Diagram ................................................................................................ 67


3.6.3 Controller Class Diagram .............................................................................................. 68


3.7 Sequence Diagrams for Proposed System .............................................................................. 69


3.7.1 Sequence Diagram for Register .................................................................................. 69


3.7.2 Sequence Diagram for Login ..................................................................................... 70


3.7.3 Sequence Diagram for Update Profile ......................................................................... 71


3.7.4 Sequence Diagram for Manage Product Details............................................................ 72


3.7.5 Sequence Diagram for Manage Orders ........................................................................ 73


3.7.6 Sequence Diagram for Manage Inventory .................................................................... 74


3.7.7 Sequence Diagram for Request Returns (Supplier) ....................................................... 75


3.7.8 Sequence Diagram for Request Return (Customer) ....................................................... 75


3.7.9 Sequence Diagram for Receive the Order (Customer) ................................................... 76


vi


3.7.10 Sequence Diagram for Place the Order (Supplier) ........................................................... 77


3.7.11 Sequence Diagram for Prepare Invoice .......................................................................... 77


3.7.12 Sequence Diagram for Track Order ............................................................................... 78


3.7.13 Sequence Diagram for Report Generation ...................................................................... 78


3.7.14 Sequence Diagram for Add Compliments & Complaints .................................................. 79


3.8 ER Diagram for Proposed System ......................................................................................... 80


3.9 Relational Data Model for Proposed System .......................................................................... 81


3.10 Table Specification and Record Specification ....................................................................... 82


3.10.1 Customer Table .......................................................................................................... 82


3.10.2 Supplier Table ............................................................................................................ 83


3.10.3 Customer Order Table ................................................................................................. 83


3.10.4 Supplier Order Table ................................................................................................... 84


3.10.5 Product Table ............................................................................................................. 85


3.10.6 Order Item Table ......................................................................................................... 86


3.11 User Interfaces design for Proposed System ......................................................................... 87


3.12 Summary ....................................................................................................................... 106


Chapter 4 .................................................................................................................................. 107


4.1 Introduction ..................................................................................................................... 108


4.2 Programming Languages and Development Tools ................................................................. 108


4.2.1 React.js ..................................................................................................................... 108


4.2.2 Vite ........................................................................................................................... 109


4.2.3 Node.js ...................................................................................................................... 109


4.2.4 Tailwind CSS ............................................................................................................. 109


4.2.5 MySQL ..................................................................................................................... 109


4.2.6 Figma ....................................................................................................................... 110


4.2.7 Visual Studio Code ..................................................................................................... 110


4.2.8 GitHub ...................................................................................................................... 110


4.2.9 Postman .................................................................................................................... 110


4.3 User Interface Demonstration and Data Entry Screens ........................................................... 111


4.3.1 Home Page ................................................................................................................ 111


4.3.2 About Us ................................................................................................................... 111


4.3.3 Featured Products ....................................................................................................... 112


4.3.4 Contact Us ................................................................................................................. 112


vii


4.3.5 Footer ....................................................................................................................... 113


4.3.6 Login Page ................................................................................................................ 113


4.3.7 Create Account Page ................................................................................................... 114


4.3.8 Forgot Password ......................................................................................................... 114


4.3.9 Password Reset Link ................................................................................................... 114


4.3.10 Admin ..................................................................................................................... 115


4.3.10.1 Admin Dashboard .............................................................................................. 115


4.3.10.2 User Management .............................................................................................. 115


4.3.10.3 Request an Order ............................................................................................... 116


4.3.10.4 Inventory Management ....................................................................................... 116


4.3.10.5 Inventory Low Stock .......................................................................................... 117


4.3.10.6 Raw Material Management ................................................................................. 117


4.3.10.7 Pending Customer Order Management ................................................................. 118


4.3.10.8 Approved Customer Order Management ............................................................... 118


4.3.10.9 Supplier Order Management ............................................................................... 119


4.3.10.10 Customer Order Refund .................................................................................... 119


4.3.10.11 Return Request ................................................................................................ 120


4.3.10.12 Company Inventory.......................................................................................... 120


4.3.10.13 Company Inventory View Logs ......................................................................... 121


4.3.11 Supplier ................................................................................................................... 121


4.3.11.1 Supplier Registration Form ................................................................................. 121


4.3.11.2 Supplier Details ................................................................................................. 122


4.3.11.3 Supplier Orders ................................................................................................. 122


4.3.11.4 Supplier Return Request ..................................................................................... 123


4.3.12 Customer ................................................................................................................. 123


4.3.12.1 Product Page ..................................................................................................... 123


4.3.12.2 Customer Profile ............................................................................................... 124


4.3.12.3 Cart ................................................................................................................. 125


4.3.12.4 Invoice ............................................................................................................. 126


4.4 Special Implementations .................................................................................................... 127


4.4.1 Frontend Validation .................................................................................................... 127


4.4.2 Backend Validation ..................................................................................................... 128


viii


4.4.3 Error Handling ........................................................................................................... 129


4.5 Quality Assurance Methods Used ....................................................................................... 130


4.6 Reports ............................................................................................................................ 131


4.6.1 Inventory Report ........................................................................................................ 131


4.6.2 Webstore Report ......................................................................................................... 132


4.6.3 Customer Report ........................................................................................................ 133


4.6.4 Supplier Report .......................................................................................................... 134


4.7 Summary ......................................................................................................................... 135


Chapter 5 .................................................................................................................................. 136


5.1 Introduction ..................................................................................................................... 137


5.2 Degree of Objectives met .................................................................................................. 137


5.3 Usability, Accessibility, Reliability, and Friendliness ............................................................. 137


5.4 Limitations and Drawbacks ................................................................................................ 138


5.5 Future Modifications, Improvements, and Extensions Possible ............................................... 138


5.6 Summary ......................................................................................................................... 139


Chapter 6 .................................................................................................................................. 140


6.1 References ....................................................................................................................... 140


ix


# List of Figures

Figure 1: Factory Logo .................................................................................................................. 2

Figure 2: Factory .......................................................................................................................... 2
Figure 3: Use Case Diagram for Existing System ............................................................................ 14
Figure 4: Activity Diagram for register ........................................................................................... 19
Figure 5: Activity Diagram for Place the Order ............................................................................... 20
Figure 6: Activity Diagram for Receive Orders from Customer ......................................................... 21
Figure 7: Activity Diagram for Inventory Management .................................................................... 22
Figure 8: Activity Diagram for Send Invoice ................................................................................... 23
Figure 9: Activity Diagram for Request Returns .............................................................................. 24
Figure 10: BSO 1-Architectural Overview ...................................................................................... 29
Figure 11: BSO 2-Architectural Overview ...................................................................................... 31
Figure 12: BSO 3-Architectural Overview ...................................................................................... 32
Figure 13: Use Case Diagram for Proposed System ......................................................................... 42
Figure 14: Activity Diagram for Register ........................................................................................ 52
Figure 15: Activity Diagram for Login ........................................................................................... 53
Figure 16: Activity Diagram for Update Profile ............................................................................... 54
Figure 17: Activity Diagram for Report Generation ......................................................................... 55
Figure 18: Activity Diagram for Manage Product Details ................................................................. 56
Figure 19: Activity Diagram for Manage Orders .............................................................................. 57
Figure 20: Activity Diagram for Manage Inventory .......................................................................... 58
Figure 21: Activity Diagram for Request Return (Supplier) .............................................................. 59
Figure 22: Activity Diagram for Request Return (Customer) ............................................................. 60
Figure 23: Activity Diagram for Receive the Order (Customer) ......................................................... 61
Figure 24: Activity Diagram for Place the Order (Supplier) .............................................................. 62
Figure 25: Activity Diagram for Track Order .................................................................................. 63
Figure 26: Activity Diagram for Add Compliments & Complaints ..................................................... 64
Figure 27: Activity Diagram for Prepare Invoice ............................................................................. 65

Figure 28: Entity Class Diagram................................................................................................... 66

Figure 29: Interface Class Diagram.............................................................................................. 67

Figure 30: Controller Class Diagram ............................................................................................ 68
Figure 31: Sequence Diagram for Register ...................................................................................... 69
Figure 32: Sequence Diagram for Login ......................................................................................... 70
Figure 33: Sequence Diagram for Update Profile ............................................................................. 71
Figure 34: Sequence Diagram for Manage Product Details ............................................................... 72
Figure 35: Sequence Diagram for Manage Orders ............................................................................ 73
Figure 36: Sequence Diagram for Manage Inventory ....................................................................... 74
Figure 37: Sequence Diagram for Request Returns (Supplier) ........................................................... 75
Figure 38: Sequence Diagram for Request Return (Customer) ........................................................... 75
Figure 39: Sequence Diagram for Receive the Order (Customer) ....................................................... 76
Figure 40: Sequence Diagram for Place the Order (Supplier) ............................................................ 77
Figure 41: Sequence Diagram for Prepare Invoice ........................................................................... 77
Figure 42: Sequence Diagram for Track Order ................................................................................ 78


x


Figure 43: Sequence Diagram for Report Generation ....................................................................... 78
Figure 44: Sequence Diagram for Add Compliments & Complaints .................................................. 79

Figure 45: ER Diagram ................................................................................................................ 80

Figure 46: Relational Data Model for Proposed System ................................................................ 81
Figure 47: Home Screen UI .......................................................................................................... 87
Figure 48: Login Screen UI .......................................................................................................... 88
Figure 49: Login Screen UI .......................................................................................................... 88
Figure 50: Create Account UI........................................................................................................ 89
Figure 51: Forgot Password UI ...................................................................................................... 89
Figure 52: Email Authentication UI ............................................................................................... 90
Figure 53: Manager Dashboard – User Management – Active Users UI .............................................. 90
Figure 54: Manager Dashboard – User Management – Pending Registration UI .................................. 91
Figure 55: Manager Dashboard – Place the Order UI ....................................................................... 91
Figure 56: Manager Dashboard – Order Management – Pending Customer Order UI ........................... 92
Figure 57: Manager Dashboard – Order Management – Approved Orders UI ...................................... 92
Figure 58: Manager Dashboard – Order Management – Supplier Orders UI ........................................ 93
Figure 59: Manager Dashboard – Inventory Management – Current Inventory UI ............................... 93
Figure 60: Manager Dashboard – Inventory Management – Low Stock Items UI ................................. 94
Figure 61: 3.10.15 Manager Dashboard – Reports – Inventory Report UI ........................................... 94
Figure 62: Manager Dashboard – Reports – Sales Report UI ............................................................. 95
Figure 63: Manager Dashboard – Reports – Customer Invoice UI ..................................................... 95
Figure 64: Manager Dashboard – Reports – Supplier Report UI ........................................................ 96
Figure 65: Manager Dashboard – Return Request – Request from Customers UI ................................. 96
Figure 66: Manager Dashboard – Return Request – Request to Suppliers UI ....................................... 97
Figure 67: Manager Dashboard – Communication Hub – Customer Feedback UI ................................ 97
Figure 68: Manager Dashboard – Communication Hub – Supplier Feedback UI .................................. 98
Figure 69: Manager Dashboard – Edit Profile UI ............................................................................. 98
Figure 70: Supplier Dashboard – Order Management – New Order Request UI ................................... 99
Figure 71: Supplier Dashboard – Order Management – Confirmed Orders UI ..................................... 99
Figure 72: Supplier Dashboard – Inventory Supply – Current Supply List UI .................................... 100
Figure 73: Supplier Dashboard – Inventory Supply – Supply History UI .......................................... 100
Figure 74: Supplier Dashboard – Return Request UI ...................................................................... 101
Figure 75: Supplier Dashboard – Feedback UI .............................................................................. 101
Figure 76: Supplier Dashboard – Edit Profile UI ........................................................................... 102
Figure 77: Customer Dashboard – Place Order – View & Add Products UI ....................................... 103
Figure 78: Customer Dashboard – Place Order – Order Summary UI ............................................... 103
Figure 79: Customer Dashboard – Order Tracking – Active Orders UI ............................................. 104
Figure 80: Customer Dashboard – Order Tracking – Order History UI ............................................. 104
Figure 81: Customer Dashboard – Return Request UI .................................................................... 105
Figure 82: Customer Dashboard – Feedback UI ............................................................................ 105
Figure 83: Customer Dashboard – Edit Profile UI .......................................................................... 106
Figure 84 - Home Page ............................................................................................................... 111
Figure 85 - About Us ................................................................................................................. 111
Figure 86 - Featured Products ..................................................................................................... 112


xi


Figure 87 - Contact Us ............................................................................................................... 112
Figure 88 - Footer ...................................................................................................................... 113
Figure 89 - Login Page ............................................................................................................... 113
Figure 90 - Create Account Page ................................................................................................. 114
Figure 91 - Forgot Password ....................................................................................................... 114
Figure 92 - Password Reset ......................................................................................................... 114
Figure 93 - Admin Dashboard ..................................................................................................... 115
Figure 94 - User Management ..................................................................................................... 115
Figure 95 - Request an Order ...................................................................................................... 116
Figure 96 - Inventory Management .............................................................................................. 116
Figure 97 - Inventory Low Stock ................................................................................................. 117
Figure 98 - Raw Material Management ........................................................................................ 117
Figure 99 - Pending Customer Order Management ........................................................................ 118
Figure 100 - Approved Customer Order Management .................................................................... 118
Figure 101 - Supplier Order Management ..................................................................................... 119
Figure 102 - Customer Order Refund ........................................................................................... 119
Figure 103 - Return Request ....................................................................................................... 120
Figure 104 - Company Inventory ................................................................................................. 120
Figure 105 - Company Inventory View Logs ................................................................................. 121
Figure 106 - Supplier Registration Form ..................................................................................... 121
Figure 107 - Supplier Details ...................................................................................................... 122
Figure 108 - Supplier Orders ....................................................................................................... 122
Figure 109 - Supplier Return Request .......................................................................................... 123
Figure 110 - Product Page ........................................................................................................... 123
Figure 111 - Customer Profile I ................................................................................................... 124
Figure 112 - Customer Profile II .................................................................................................. 124
Figure 113 - Customer Profile III ................................................................................................. 125
Figure 114 - Cart ....................................................................................................................... 125
Figure 115 - Customer Invoice .................................................................................................... 126
Figure 116 - Preventing negative quantity inputs ........................................................................... 127
Figure 117 - Validate required fields and expiry date before adding ................................................. 127
Figure 118 - Check stock availability from backend before updating ................................................ 128
Figure 119 - Catching errors and showing toast ............................................................................. 129
Figure 120 - Inventory Report ..................................................................................................... 131
Figure 121 - Webstore Report ..................................................................................................... 132
Figure 122 - Customer Report ..................................................................................................... 133
Figure 123 - Supplier Report ....................................................................................................... 134


xii


# List of Tables

Table 1: Manager User Stories ...................................................................................................... 11

Table 2: Customer User Stories ..................................................................................................... 12

Table 3: Supplier User Stories ....................................................................................................... 13
Table 4: Use Case Description for Register ..................................................................................... 15
Table 5: Use Case Description for Place the Order ........................................................................... 16
Table 6: Use Case Description for Receive the Order from Customer ................................................. 16
Table 7: Use Case Description for Manage Inventory ....................................................................... 17
Table 8: Use Case Description for Send Invoice .............................................................................. 18
Table 9: Use Case Description for Request Return ........................................................................... 18
Table 10: Functional Requirements ................................................................................................ 26
Table 11: Non-Functional Requirements ......................................................................................... 27
Table 12: BSO 1- Cost-Benefit Analysis ......................................................................................... 29
Table 13: BSO 2- Cost-Benefit Analysis ......................................................................................... 31
Table 14: BSO 3- Cost-Benefit Analysis ......................................................................................... 33
Table 15: BSO vs Functional Requirements .................................................................................... 35
Table 16: BSO vs Non-Functional Requirements ............................................................................. 36
Table 17: Functional Requirements ................................................................................................ 40
Table 18: Non-Functional Requirements ......................................................................................... 41
Table 19: Use Case Description for Register ................................................................................... 43
Table 20: Use Case Description for Login ....................................................................................... 44
Table 21: Use Case Description for Update Profile .......................................................................... 45
Table 22: Use Case Description for Report Generation ..................................................................... 45
Table 23: Use Case Description for Manage Product Details ............................................................. 46
Table 24: Use Case Description for Manage Orders ......................................................................... 46
Table 25: Use Case Description for Customer Request Returns ......................................................... 47
Table 26: Use case Description for Manager Request Returns from Supplier ....................................... 48
Table 27: Use case Description for Receive the Order ...................................................................... 48
Table 28: Use case Description for Manage Inventory ..................................................................... 49
Table 29: Use case Description for Place the Order .......................................................................... 50
Table 30: Use case Description for Track Order ............................................................................... 50
Table 31: Use case Description for Add Customer/Supplier Feedback or Complaints ........................... 51
Table 32: Use case Description for Prepare Invoice.......................................................................... 51


xiii


## Chapter 1

**Outline of the Chapter**


1.1 Introduction


1.2 Description of the Business


1.3 Business Process


1.4 Existing System – Problems and Weaknesses


1.5 Aims and Objectives


1.6 Scope of the Project


1.7 Organization of the Report


1.8 Summary

### 1.1 Introduction


This chapter provides an overview of the organization, current business processes, and the
proposed system. The current problems and weaknesses of the system are discussed, while
reviewing its goals and scope. At the end, it provides an outline of the entire report.


1


### 1.2 Description of the Business

This project will be about a yogurt factory operating without any digital system to control its
daily activities. The location is Matara, where a small-scale yogurt factory operates,
manufacturing yogurt and selling it to different retail shops. There are key areas of enhancement
involving inventory, order, and communication processes.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-15-0.png)


_Figure 1: Factory Logo_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-15-2.png)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-15-4.png)


_Figure 2: Factory_


2



![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-15-1.png)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-15-3.png)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-15-5.png)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-15-6.png)
### 1.3 Business Process

Currently, all major processes in this factory are manual. The manager does everything from
keeping the inventory to placing orders and informs the suppliers and customers directly about
their orders. The main processes that will be focused on are:


1. New Customer and Supplier Registration


2. Order Placement and Tracking


3. Inventory Management and Low Stock Alerts


4. Customer and Supplier Complaints and Feedback


5. Reporting for Sales, Inventory, and Order Records


A short description of each of the processes is explained below.


1. New Customer and Supplier Registration


New customers and suppliers are enrolled manually. All information is recorded in some
sort of registration book, which can be very time-consuming and may lead to errors.


2. Order Placement and Tracking


Orders are placed by hand. There is no automation involved in tracking orders; this might
delay the processing and communication of the order.


3. Inventory Management and Low Stock Alerts


Manual tracking of inventory is done by the manager; therefore, he doesn't quite know
the level of stock in order to predict when it would be out.


4. Customer and Supplier Complaints and Feedback

Feedback is managed manually. This slows down the processes involved in addressing

customer concerns.

5. Reporting

Manual compilation of reports based on inventory, sales, and other records is slow and
may contain errors.


3


### 1.4 Existing System – Problems and Weaknesses

The manual system at present has several faults:


  - Time-Consuming: Almost everything requires more time to execute. This is because most

of them have to do with manual recordings and calculations.

  - Risk of Human Error: In all instances, there is always the probability that manual

recordings may hold errors.

  - Tracking of Inventory: The inventory of items cannot be easily tracked.


  - Delay in Communication: There doesn't seem to be an obvious quick method of

informing both suppliers and customers about the state of their orders.

  - Lack of Accessibility: Clients and suppliers cannot access information directly; therefore,

delays are there.

  - Reporting: Reports generated manually have the possibility of errors and are often late.

### 1.5 Aims and Objectives


**Aim**


The project aims to facilitate the yogurt factory in being more efficient with its daily operations
through a digital management system to handle orders, inventory, and communications.


**Objectives**


1. Automation in Order Management


With this system, online orders are immediately reflected in inventory and instantly
notify the production team of new orders. Automation reduces the time required for the
processing of every order while minimizing the chances of any mistake occurring, such
as wrong quantities or missing orders. It will also ensure that orders are quickly and
precisely processed so that efficiency is assured in taking customer orders.


4


2. Effective handling of suppliers


Records of all supplier details regarding delivery schedules, payments, and contract terms
will be maintained on the system. Each delivery will be tracked to ensure that the factory
receives on time whatever is required. These records will be updated regularly to avoid
production delays due to lack of raw materials or other supplies. The factory will also be
able to maintain good relations with the suppliers by making timely payments and
keeping records of the contracts.


3. Inventory Control


In this way, the system immediately updates the stock records of inventory whenever
there is an issue or receipt of stock. It allows the tracking of raw materials such as milk,
its ingredients, and finished yogurt products in real-time. With a clear overview of the
actual amount of stock on hand, the factory will avoid running out of essential stocks or
their expiration dates.


4. Better Record Keeping


All transactions, from customer orders to paying suppliers, would automatically be kept
on record in the system. Digital record-keeping allows for the tracking of financial
information easily, which can help the factory manager work better on budgeting and
making payments. Once this kind of information has been safely recorded, one can track
previous transactions that have occurred and make sure no important detail passes
without notice.


5. Improved Communications


The system will allow the factory, suppliers, and customers to have real-time cognizance
of information pertaining to the latest developments. For instance, customers will have
exact knowledge as to the stage their orders are in, the suppliers will be informed when
the inventories need replenishment, and the employees within the factory will know what
the production schedule is on a current basis. Everyone being on the same page promotes
a much clearer process with less confusion or delay in production.


6. Scalability


The system also grows with the needs of the factory: it will not fall behind or show errors
with increased volume when there are more orders, customers, and suppliers. It means the
factory is not going to need any new system for a long time, while its business is scaling
up, which again is sustainable for long-term success.


5


### 1.6 Scope of the Project

The aims of the project are to design and develop a web-based system for managing the yogurt
factory's main operations. Main features of such a system are enlisted as under:


1. Registration and Profile Management: For the manager, customers, and suppliers. The

manager can register customers and suppliers, manage profiles, and log in with an
administrative role. Customers and suppliers can register and manage their profiles, with
manager approval as needed.

2. Order Management: Order management aimed at easing the processing of orders,

tracking, and notification.

3. Inventory Control: The system provides inventory management for tracking the level of

stock and sending automatic notifications upon the realization of low stock levels.

4. Complaint and Feedback Management: Easy complaint and feedback

submission/reviewing.

5. Report Generation: Automatic generation of reports regarding inventory, sales, and other

records.


6


### 1.7 Project Feasibility

**Technical Feasibility**


The yogurt factory currently uses only basic digital tools, such as mobile phones and standard desktop
computers, for communication and record keeping. The proposed system is technically feasible, as it can
be implemented using widely available web technologies like React, Node.js, and MySQL. These
technologies are lightweight, scalable, and easy to deploy on common hardware.


Factory staff, including the manager, suppliers, and retail customers, require only basic training to interact
with the system through a web interface. Data security will be ensured using password encryption, rolebased access, and system backups. Future scalability is also supported through modular development,
allowing for system upgrades as business needs grow.


**Economic Feasibility**


The system is cost-effective for a small business. Expenses include development, hosting, and minimal
maintenance. In return, it reduces manual work, speeds up operations, and lowers the risk of errors,
offering long-term savings and improved efficiency.


**Legal Feasibility**


There are no legal barriers to implementation. User data like contact and order details will be stored
securely and accessed only by authorized roles. Future integrations, such as payment systems, will follow
standard data protection practices.


7


### 1.8 Organization of the Report

This report contains four major chapters:


**Chapter 1:**


Introductory chapter to the project, which includes objectives and the scope of project.


**Chapter 2:**


System Analysis describes the present system, its requirements, and the resulting analysis of
those needs.


**Chapter 3:**


System Design includes proposed system design with full diagrams and database structures in
detail.


**Chapter 4:**


System Implementation describes the tools and technologies used to develop the system,
including frontend and backend implementations, user interfaces, validations, and report
generation.


**Chapter 5:**


Evaluation and Discussion covers how well the project met its objectives, discusses usability and
system quality, highlights limitations, and suggests possible future improvements.


**Chapter 6:**


References of the project.

### 1.9 Summary


In this chapter, the business context and procedures of the yogurt factory were discussed, some
problems in the existing manual system were shown, and the aims and objectives for this system
were outlined. Upcoming chapters will consider the analysis of the current system and the design
of the new system.


8


# Chapter 2

**Outline of the Chapter**


2.1 Introduction


2.2 User Stories for Existing System


2.3 Use Case Diagram for Existing System


2.4 Use Case Description for Existing System


2.5 Activity Diagrams for Existing System


2.6 Software Requirements Specification


2.6.1 Functional Requirements


2.6.2 Non-functional Requirements


2.7 Software Requirements Specification (BSO)


2.8 BSO Analysis and Requirements Evaluation


2.8.1 BSO vs Functional Requirements


2.8.2 BSO vs Non-Functional Requirements


2.9 Summary


9


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-23-0.png)


|Id|User Story|
|---|---|
|US 01|As a manager, I want to register new customers so that I can expand our<br>client base.|
|US 02|As a manager, I want to register new suppliers so that I can ensure a steady<br>supply of ingredients.|
|US 03|As a manager, I want to log into the system so that I can manage operations<br>securely.|
|US 04|As a manager, I want to generate reports on inventory, sales, customers,<br>suppliers, and canceled orders so that I can analyze business performance.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-24-0.png)


|US 05|As a manager, I want to view current stock levels of yogurt and milk, so<br>that I can ensure enough raw materials and finished products are available.|
|---|---|
|US 06|As a manager, I want to receive low-stock alerts, so that I can reorder milk<br>and yogurt packaging on time.|
|US 07|As a manager, I want to manage inventory by adding or removing items so<br>that stock levels are accurate.|
|US 08|As a manager, I want to view all incoming orders from customers, so that I<br>can plan production and prioritize order fulfillment.|
|US 09|As a manager, I want to update the status of each order (e.g., processing,<br>completed), so that customers can track their orders.|
|US 10|As a manager, I want to track all orders so that I can oversee the entire<br>order fulfillment process.|
|US 11|As a manager, I want to receive requests for returns and refunds from<br>customers so that I can take necessary actions.|
|US 12|As a manager, I want to request returns and refunds from suppliers so that I<br>can maintain good relationships with our partners.|
|US 13|As a manager, I want to view and respond to compliments and complaints<br>from customers and suppliers so that I can improve our services.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-25-0.png)


|Id|User Story|
|---|---|
|US 14|As a customer, I want to register on the website so that I can place orders<br>for yogurt products.|
|US 15|As a customer, I want to log into the system so that I can access my<br>account and order history.|
|US 16|As a customer, I want to update my contact and delivery information, so<br>that orders are delivered to the correct location.|
|US 17|As a customer, I want to browse yogurt products, so that I can select the<br>items I need.|
|US 18|As a customer, I want to place an order for yogurt products so that I can<br>replenish my shop's inventory.|
|US 19|As a customer, I want to track my order status so that I know when to<br>expect delivery.|
|US 20|As a customer, I want to request returns and refunds so that I can manage<br>any issues with my orders.|
|US 21<br>|As a customer, I want to submit compliments or complaints so that I can<br>provide feedback on my experience.<br>|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-26-0.png)


|Id|User Story|
|---|---|
|US 22|As a supplier, I want to register with the system so that I can become a<br>recognized partner of the yogurt factory.|
|US 23|As a supplier, I want to log into the system so that I can manage my orders<br>and interactions with the factory.|
|US 24|As a supplier, I want to update my contact and company information, so<br>that the factory has the most recent details for communication.|
|US 25|As a supplier, I want to receive notifications for milk supply requests, so<br>that I know when and how much milk to deliver to the factory.|
|US 26|As a supplier, I want to view purchase orders from the manager so that I<br>can fulfill them promptly.|
|US 27|As a supplier, I want to update the status of my deliveries so that the<br>manager can track supply shipments.|
|US 28<br>|As a supplier, I want to submit compliments or complaints so that I can<br>communicate my feedback regarding the business relationship.<br>|


### 2.3 Use Case Diagram for Existing System

This section develops an overall use case diagram showing main interactions between the actors
that include manager, customers and suppliers and a process of current manual system. The
diagram maps all the important activities each actor conducts and gives a drawn summary of the
functionality and the limitations of the system in its present state.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-27-0.png)


_Figure 3: Use Case Diagram for Existing System_


14


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-28-0.png)








|Use Case Id|CUC-01|
|---|---|
|Name|Register|
|Actors|Manager|
|Description|The manager registers new customers and suppliers by manually<br>recording their details.|
|Pre-Condition|The customer is registered and provides the necessary order details.|
|Main Flow|• The manager collects contact and company details from the<br>customer or supplier.<br>• The manager manually writes down or records the details.<br>• The registration is completed, allowing the customer to place<br>orders or the supplier to deliver products.|
|Post-Condition|The order is recorded for processing and fulfillment.|


|Use Case Id|CUC-02|
|---|---|
|Name|Place the Order|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-29-0.png)








|Actors|Supplier, Manager|
|---|---|
|Description|The manager places an order with suppliers for milk and other<br>ingredients.|
|Pre-Condition|The need for stock replenishment is identified.|
|Main Flow|• The manager reviews current stock levels and identifies the<br>need to order from suppliers.<br>• The manager contacts the supplier with details of the required<br>quantities and items.<br>• The supplier confirms the order, preparing for delivery.|
|Post-Condition|The supplier receives the order request and prepares for delivery.|








|Use Case Id|CUC-03|
|---|---|
|Name|Receive the Order from Customer|
|Actors|Customer, Manager|
|Description|A customer places an order for yogurt products by contacting the<br>factory, and the manager records it manually.|
|Pre-Condition|The customer is registered and provides the necessary order details.|
|Main Flow|• The customer contacts the manager with order details.<br>• The manager writes down the order information, including the<br>type and quantity of yogurt.|
|Post-Condition|The order is recorded for processing and fulfillment.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-30-0.png)








|Use Case Id|CUC-04|
|---|---|
|Name|Manage Inventory|
|Actors|Manager|
|Description|The manager manually checks and updates inventory levels of yogurt<br>and milk.|
|Pre-Condition|Stock levels need to be checked or updated.|
|Main Flow|• The manager inspects the inventory physically.<br>• The manager records stock counts or updates inventory levels<br>manually.<br>• If stock is low, the manager notes the need for reordering<br>supplies.|
|Post-Condition|Updated inventory records reflect current stock levels.|


|Use Case Id|CUC-05|
|---|---|
|Name|Send Invoice|
|Actors|Manager|
|Description|The manager prepares and issues invoices to customers after their<br>orders are recorded.|
|Pre-Condition|An order is placed, and the customer details are available.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-31-0.png)






|Main Flow|• The manager calculates the cost of the order.<br>• An invoice is manually prepared with details of the order and<br>total amount.<br>• The invoice is handed or sent to the customer.|
|---|---|
|Post-Condition|The customer receives the invoice, and the factory has a record of it.|








|Use Case Id|CUC-06|
|---|---|
|Name|Request Returns|
|Actors|Customer, Manager|
|Description|Customers request returns or refunds, and the manager processes these<br>requests.|
|Pre-Condition|A customer has an issue with a received product or order.|
|Main Flow|• The customer contacts the manager with a return or refund<br>request.<br>• The manager assesses the request and determines the eligibility<br>for a return or refund.<br>• If approved, the manager records the return or refund manually<br>and provides compensation or product replacement.|
|Post-Condition|The return or refund is recorded, and corrective action is taken.|


### 2.5 Activity Diagrams for Existing System

Here, activity diagrams map the workflows of current processes, drawing a series of tasks and
decisions made by different actors. Each diagram represents, step by step, how activities have
been performed manually.

#### 2.5.1 Activity diagram for Register


Activity diagram explains how a user registers for an account in the system.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-32-0.png)


_Figure 4: Activity Diagram for register_


19


#### 2.5.2 Activity Diagram for Place the Order (Supplier)

Activity diagram explains how the manager places an order with a supplier.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-33-0.png)


_Figure 5: Activity Diagram for Place the Order_


20


#### 2.5.3 Activity Diagram for Receive Orders from Customer

Activity diagram explains how the system receives and processes customer orders.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-34-0.png)


_Figure 6: Activity Diagram for Receive Orders from Customer_


21


#### 2.5.4 Activity Diagram for Inventory Management

Activity diagram explains how the manager manages and updates inventory levels.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-35-0.png)


_Figure 7: Activity Diagram for Inventory Management_


22


#### 2.5.5 Activity Diagram for Send Invoice

Activity diagram explains how the supplier generates and sends an invoice to the manager.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-36-0.png)


_Figure 8: Activity Diagram for Send Invoice_


23


#### 2.5.6 Activity Diagram for Request Returns

Activity diagram explains how customers request returns for purchased products.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-37-0.png)


_Figure 9: Activity Diagram for Request Returns_


24


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-38-0.png)








|Id|Requirement|
|---|---|
|01|The manager shall be able to register new customers and suppliers.|
|02|Customers shall be able to register through the website, subject to the<br>manager's approval.|
|03|The manager, suppliers, and customers shall be able to log in to the system<br>using their credentials.|
|04|The system shall allow users to update their profile information.|
|05|The system shall generate the following reports:<br>a. Inventory report<br>b. Sales report<br>c. Customer report<br>d. Supplier report|
|06|Should be able to generate reports on request.|
|07|The system shall provide functionality for managers to add, edit, and remove<br>product details in the inventory.|
|08|The system should automatically notify the manager of low stock levels to<br>facilitate timely restocking.|
|09|Customers shall be able to place orders through the system.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-39-0.png)


|10|The manager shall be able to place orders with suppliers using the system.|
|---|---|
|11|Manager shall be able to manage orders.|
|12|Customers shall be able to request returns and refunds from the manager<br>through the system.|
|13|The manager shall be able to view and take action on return and refund<br>requests received from the customers.|
|14|Manager shall be able to request returns and refunds from suppliers through<br>the system.|
|15|The system should revise package rates based on inventory levels and<br>customer demand.|
|16|Customers and suppliers should be able to track their respective orders.|
|17|The manager should be able to track all orders.|
|18|The system should notify the manager, customers, and suppliers of order<br>statuses and any updates (order confirmation, shipment, delivery).|
|19|System should provide decision-making support for managers (analytics,<br>insights).|
|20|Suppliers and customers shall be able to submit compliments or complaints<br>about the business.|
|21|The manager shall be able to view all compliments and complaints.|
|22|The system should facilitate online payments.|
|23|The system should facilitate online reservations.|
|24|System should allow web-based advertising and promotions.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-40-0.png)


|Id|Requirement|
|---|---|
|01|System shall be able to provide a friendly GUI|
|02|System shall run on all Windows OS|
|03|System shall implement role-based access control|
|04|System should be scalable to accommodate an increase in users, inventory, and<br>order volumes.|
|05|System should provide a web interface|
|06|System should provide security for online transactions|
|07|System should provide decision-making support and analytic|
|08|System should offer advertising capabilities|


### 2.7 Business System Option (BSO)

The options specify a set of alternative solutions to develop the system, with different functional
scopes and technological features. Each option is matched against the provision of the
functionality looked by the users, meeting the business objectives, and facilitating or enhancing
operational efficiency.

#### 2.7.1 BSO 1: Basic System with Essential Features 1. Functional Description and Architectural Overview


**Functional Description:**


BSO 1 provides the fundamental system features required for basic operations in the yogurt
factory. It enables customer and supplier registration, login functionalities, order management
(customers placing orders, the manager ordering from suppliers), and basic inventory
management (view, add, remove items). Additionally, it supports the submission and viewing of
complaints and compliments. The system generates basic reports for inventory, sales, and

customers.


**Architectural Overview:**


Client-side: Web-based user interface for customers and managers
Server-side: Database management system (DBMS) to handle user data, orders, and inventory
Database: Relational database to store customer, supplier, order, and inventory information


28


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-42-0.png)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-42-1.png)


|Cost Component|Description|Cost Estimation (LKR)|
|---|---|---|
|Hardware Cost|Physical devices needed for<br>the system|60,000|
|Hosting Cost|Annual hosting service fees|10,000|
|Maintenance Cost|Annual maintenance and<br>support|10,000|
|Total<br>||80,000|


#### 2.7.2 BSO 2: Intermediate System with Additional Automation 1. Functional Description and Architectural Overview

**Functional Description:**


BSO 2 introduces automation to the core system. In addition to all BSO 1 features, it adds
automated report generation (on-demand and scheduled), return/refund handling, and order
tracking for both customers and suppliers. The system also supports online payments, expanding
its functionality for customers. Enhanced security features, such as encryption, protect sensitive
data, including payments.


**Architectural Overview:**


Client-side: Enhanced web-based user interface for customers and managers with automated
report generation features


Server-side: Advanced DBMS with automation scripts for report generation and order tracking


Database: Relational database with additional tables for automated processes and payment
information


30


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-44-0.png)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-44-1.png)


|Cost Component|Description|Cost Estimation (LKR)|
|---|---|---|
|Hardware Cost|Physical devices needed for<br>the system|60,000|
|Hosting Cost|Annual hosting service fees|20,000|
|Maintenance Cost|Annual maintenance and<br>support|20,000|
|Total<br>||100,000|


#### 2.7.3 BSO 3: Advanced System with Decision-Making Support 1. Functional Description and Architectural Overview

**Functional Description:**


BSO 3 includes all features of BSO 2, but also adds advanced functionalities like decisionmaking support for managers, analytics to track customer behavior and sales trends, and
automated package rate revisions based on demand and inventory. The system facilitates webbased advertising, allowing the business to run promotional campaigns. This option offers a fully
integrated system capable of managing large-scale operations with complex workflows.


**Architectural Overview:**


Client-side: Comprehensive web-based dashboard for customers and managers, including
analytics and promotional features
Server-side: Distributed services for user management, order processing, analytics, and
marketing
Database: Scalable cloud-based database to handle large datasets and complex queries

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-45-0.png)


_Figure 12: BSO 3-Architectural Overview_


32


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-46-0.png)


|Cost Component|Description|Cost Estimation (LKR)|
|---|---|---|
|Hardware Cost|Physical devices needed for the<br>system|120,000|
|Hosting Cost|Annual cloud hosting fees|100,000|
|Maintenance Cost|Annual maintenance and support|80,000|
|Total<br> <br>||300,000|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-47-0.png)




















|Id|Requirement|BSO 1|BSO 2|BSO 3|
|---|---|---|---|---|
|1|Manager shall be able to register<br>new customers and suppliers.|X|X|X|
|2|Customers shall register through<br>the website, subject to manager's<br>approval.|X|X|X|
|3|Manager, suppliers, and customers<br>shall log in using their credentials.|X|X|X|
|4|The system shall allow users to<br>update their profile information|X|X|X|
|5|System shall generate reports<br>(inventory, sales, customer,<br>supplier).|X|X|X|
|6|System should be able to generate<br>reports on request.||X|X|
|7|The system shall provide<br>functionality for managers to add,<br>edit, and remove product details in<br>the inventory.|X|X|X|
|8|The system should automatically<br>notify the manager of low stock<br>levels to facilitate timely<br>restocking.||X||
|9|Customers shall be able to place<br>orders through the system.|X|X|X|
|10|Manager shall place orders with<br>suppliers using the system.|X|X|X|
|11|Manager shall be able to manage<br>orders.|X|X|X|
|12|Customers shall request returns<br>and refunds from the manager.|X|X|X|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-48-0.png)


















|13|Manager shall view and process<br>return and refund requests from<br>customers.|X|X|X|
|---|---|---|---|---|
|14|Manager shall request returns and<br>refunds from suppliers.|X|X|X|
|15|System should revise package<br>rates based on inventory levels and<br>customer demand.|||X|
|16|Customers and suppliers should<br>track their orders.||X|X|
|17|Manager should track all orders.||X|X|
|18|The system should notify the<br>manager, customers, and suppliers<br>of order statuses and any updates||X|X|
|19|System should provide decision-<br>making support for managers<br>(analytics, insights).|||X|
|20|Suppliers and customers shall<br>submit complaints or<br>compliments.|X|X|X|
|21|Manager shall view all complaints<br>and compliments.|X|X|X|
|22|System should facilitate online<br>payments.|||X|
|23|System should facilitate online<br>reservations.|||X|
|24<br>|System should allow web-based<br>advertising and promotions.<br>|||X|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-49-0.png)










|Id|Requirement|BSO 1|BSO 2|BSO 3|
|---|---|---|---|---|
|1|Shall be able to provide a friendly<br>GUI|X|X|X|
|2|Shall run on all Windows OS|X|X|X|
|3|Shall implement role-based access<br>control|X|X|X|
|4|Should be scalable to<br>accommodate an increase in users,<br>inventory, and order volumes.||X||
|5|Should provide a web interface||X|X|
|6|Should provide security for online<br>transactions|||X|
|7|Should provide decision-making<br>support and analytic|||X|
|8|Should offer advertising<br>capabilities|||X|


### 2.10 Summary

The system analysis discussion summarizes the major findings, limitations of the present system,
definition of requirements, and justification for the selected BSO. It emphasizes the worthiness
for moving to the automated system: greater efficiency and accuracy, higher scalability, and sets
the stage for the design phase.


37


# Chapter 3

**Outline of the Chapter**


3.1 Introduction


3.2 Software Requirements Satisfied by the Selected BSO


3.2.1 Functional Requirements


3.2.2 Non-functional Requirements


3.3 Use Case Diagram for Proposed System


3.4 Use Case Description for Proposed System


3.5 Activity Diagrams for Proposed System


3.6 Class Diagram for Proposed System


3.6.1 Entity Class Diagram


3.6.2 Interface Class Diagram


3.6.3 Controller Class Diagram


3.7 Sequence Diagrams for Proposed System


3.8 ER Diagram for Proposed System


3.9 Relational Data Model for Proposed System


3.10 User Interfaces design for Proposed System


3.11 Summary


38


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-52-0.png)






|Id|Requirement|
|---|---|
|01|The manager shall be able to register new customers and suppliers.|
|02|Customers shall be able to register through the website, subject to the<br>manager's approval.|
|03|The manager, suppliers, and customers shall be able to log in to the system<br>using their credentials.|
|04|The system shall allow users to update their profile information.|
|05|The system shall generate the following reports:<br>a. Inventory report<br>b. Sales report<br>c. Customer report<br>d. Supplier report|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-53-0.png)


|06|Should be able to generate reports on request.|
|---|---|
|07|The system shall provide functionality for managers to add, edit, and remove<br>product details in the inventory.|
|08|The system should automatically notify the manager of low stock levels to<br>facilitate timely restocking.|
|09|Customers shall be able to place orders through the system.|
|10|The manager shall be able to place orders with suppliers using the system.|
|11|Manager shall be able to manage orders.|
|12|Customers shall be able to request returns and refunds from the manager<br>through the system.|
|13|The manager shall be able to view and take action on return and refund<br>requests received from the customers.|
|14|The manager shall be able to request returns and refunds from suppliers<br>through the system.|
|15|The system should revise package rates based on inventory levels and<br>customer demand.|
|16|Customers and suppliers should be able to track their respective orders.|
|17|The manager should be able to track all orders.|
|18|The system should notify the manager, customers, and suppliers of order<br>statuses and any updates (order confirmation, shipment, delivery).|
|19|Suppliers and customers shall be able to submit compliments or complaints<br>about the business.|
|20|The manager shall be able to view all compliments and complaints.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-54-0.png)


|Id|Requirement|
|---|---|
|01|System shall be able to provide a friendly GUI|
|02|System shall run on all Windows OS|
|03|System shall implement role-based access control|
|04|System should be scalable to accommodate an increase in users, inventory, and<br>order volumes.|
|05|System should provide a web interface|
|06<br>|System should provide security for online transactions<br>|


### 3.3 Use Case Diagram for Proposed System

The use case diagram illustrates the main interaction of users with the system, such as manager,
customer, and supplier. It captures the various actions of each supported user, like placing orders,
inventory management, report generation, and so on, therefore providing a very high-level view
of system functionality.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-55-0.png)


_Figure 13: Use Case Diagram for Proposed System_


42


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-56-0.png)














|Use Case Id|PUC-01|
|---|---|
|Name|Register Customer & Supplier|
|Actors|Manager, Customer, Supplier|
|Description|The system allows the manager to register new customers and<br>suppliers. Customers can also register through the website, subject to<br>the manager's approval.|
|Pre-Condition|The customer or supplier has provided the necessary registration<br>information.|
|Main Flow|• The customer or supplier submits registration details.<br>• The manager reviews and approves or denies the registration<br>request.<br>• If approved, the customer or supplier is added to the system<br>and receives login credentials.|
|Post-Condition<br>|The customer or supplier is registered in the system and can access<br>relevant functionalities.<br>|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-57-0.png)








|Use Case Id|PUC-02|
|---|---|
|Name|Login|
|Actors|Manager, Customer, Supplier|
|Description|Users (manager, customers, suppliers) log in to the system to access<br>features based on their roles.|
|Pre-Condition|The user is registered and has valid login credentials.|
|Main Flow|• The user enters login credentials.<br>• The system verifies the credentials.<br>• Upon successful verification, the user is directed to their<br>dashboard.|
|Post-Condition|The user is authenticated and gains access to their dashboard.|






|Use Case Id|PUC-03|
|---|---|
|Name|Update Profile|
|Actors|Manager, Customer, Supplier|
|Description|Users update their contact and other profile information as needed.|
|Pre-Condition|The user is logged in and has access to their profile.|
|Main Flow|• The user navigates to the profile section.<br>• The user updates contact, address, or other profile details.<br>• The system saves the updated information.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-58-0.png)








|Use Case Id|PUC-04|
|---|---|
|Name|Report Generation|
|Actors|Manager|
|Description|The manager generates reports on inventory, sales, customer data,<br>supplier data, and canceled orders.|
|Pre-Condition|The manager is logged in.|
|Main Flow|• The manager selects the type of report to generate.<br>• The system compiles data and creates the report.<br>• The manager views or downloads the report.|
|Post-Condition|A report is generated and available for review or download.|


|Use Case Id|PUC-05|
|---|---|
|Name|Manage Product Details|
|Actors|Manager|
|Description|The manager can add, update, or remove product details in the system.|
|Pre-Condition|The manager is logged in.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-59-0.png)






|Main Flow|• The manager navigates to the product management section.<br>• The manager edits details such as product name, description,<br>price, and stock.<br>• The system updates the product information.|
|---|---|
|Post-Condition<br>|The system reflects updated product information.<br>|








|Use Case Id|PUC-06|
|---|---|
|Name|Manage Orders|
|Actors|Manager|
|Description|The manager oversees and updates the status of all orders.|
|Pre-Condition|Orders are placed by customers or suppliers.|
|Main Flow|• The manager views all pending and processed orders.<br>• The manager updates order statuses (e.g., processing,<br>completed).<br>• Customers and suppliers are notified of status changes.|
|Post-Condition<br>|Orders are updated, and status changes are recorded.<br>|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-60-0.png)








|Use Case Id|PUC-07|
|---|---|
|Name|Customer Request Returns|
|Actors|Manager, Customer|
|Description|The customer submits a request for a return or refund through the<br>system, and the manager processes it.|
|Pre-Condition|The customer is logged in and has a recent order.|
|Main Flow|• The customer submits a return or refund request.<br>• The manager reviews the request and approves or denies it.<br>• If approved, the system updates the return status.|
|Post-Condition|The return or refund request is recorded and processed.|


|Use Case Id|PUC-08|
|---|---|
|Name|Manager Request Returns from Supplier|
|Actors|Manager, Supplier|
|Description|The manager requests a return or refund from suppliers for defective<br>or incorrect items.|
|Pre-Condition|An issue with supplier-provided items is identified.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-61-0.png)






|Main Flow|• The manager submits a return request for items received from<br>the supplier.<br>• The supplier reviews the request.<br>• The supplier processes the return or provides compensation.|
|---|---|
|Post-Condition|The supplier acknowledges the return request, and resolution is<br>pending.|








|Use Case Id|PUC-09|
|---|---|
|Name|Receive the Order|
|Actors|Manager, Customer|
|Description|Customers place orders through the system, and the manager receives<br>them for fulfillment.|
|Pre-Condition|The customer is registered and logged in.|
|Main Flow|• The customer selects items and submits an order.<br>• The system confirms the order.<br>• The manager receives notification of the new order.|
|Post-Condition|The order is saved and awaits fulfillment.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-62-0.png)








|Use Case Id|PUC-10|
|---|---|
|Name|Manage Inventory|
|Actors|Manager|
|Description|The manager can add, view, or remove inventory items as needed.|
|Pre-Condition|The manager is logged in.|
|Main Flow|• The manager views current inventory.<br>• The manager updates stock quantities.<br>• The system saves the changes and notifies low-stock alerts if<br>applicable.|
|Post-Condition<br>|Updated inventory levels reflect in the system.<br>|








|Use Case Id|PUC-11|
|---|---|
|Name|Place the Order|
|Actors|Manager, Supplier|
|Description|The manager places orders with suppliers for raw materials and<br>packaging.|
|Pre-Condition|Inventory levels indicate low stock.|
|Main Flow|• The manager selects items to order from suppliers.<br>• The system sends the order details to the supplier.<br>• The supplier confirms receipt of the order.|
|Post-Condition|The supplier receives the order request.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-63-0.png)








|Use Case Id|PUC-12|
|---|---|
|Name|Track Order|
|Actors|Manager, Customer, Supplier|
|Description|Customers and suppliers can view the status of their orders.|
|Pre-Condition|Orders have been placed in the system.|
|Main Flow|• The user logs in and navigates to order tracking.<br>• The system displays the status of pending and completed<br>orders.|
|Post-Condition<br>|Users see the current order status.<br>|


|Use Case Id|PUC-13|
|---|---|
|Name|Add Customer/Supplier Feedback or Complaints|
|Actors|Manager, Customer, Supplier|
|Description|Customers and suppliers can submit feedback or complaints, which<br>the manager can review.|
|Pre-Condition|The user is logged in.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-64-0.png)






|Main Flow|• The user submits feedback or a complaint.<br>• The system records the submission and notifies the manager.<br>• The manager reviews the feedback or complaint.|
|---|---|
|Post-Condition|Feedback or complaint is recorded.|








|Use Case Id|PUC-14|
|---|---|
|Name|Prepare Invoice|
|Actors|Manager|
|Description|The system automatically generates invoices based on customer<br>orders.|
|Pre-Condition|An order is placed by a customer.|
|Main Flow|• The system calculates order totals and generates an invoice.<br>• The invoice is added to the customer’s order history.<br>• The customer can view or download the invoice.|
|Post-Condition|The invoice is available for the customer to view or download.|


### 3.5 Activity Diagrams for Proposed System

For each of the critical system processes, activity diagrams have been developed to show the
flow of events for processes such as place order, update inventory, and generate reports. Each of
these diagrams has outlined the steps that the users and the system take in managing a specific
task; therefore, visually showing how each function is realized.

#### 3.5.1 Activity Diagram for Register

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-65-0.png)


_Figure 14: Activity Diagram for Register_


52


#### 3.5.2 Activity Diagram for Login

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-66-0.png)

_Figure 15: Activity Diagram for Login_



53


#### 3.5.3 Activity Diagram for Update Profile

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-67-0.png)

_Figure 16: Activity Diagram for Update Profile_


54


#### 3.5.4 Activity Diagram for Report generation

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-68-0.png)

_Figure 17: Activity Diagram for Report Generation_


55


#### 3.5.5 Activity Diagram for Manage Product Details

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-69-0.png)

_Figure 18: Activity Diagram for Manage Product Details_


56


#### 3.5.6 Activity Diagram for Manage Orders

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-70-0.png)

_Figure 19: Activity Diagram for Manage Orders_


57


#### 3.5.7 Activity Diagram for Manage Inventory

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-71-0.png)

_Figure 20: Activity Diagram for Manage Inventory_


58


#### 3.5.8 Activity Diagram for Request Return (Supplier)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-72-0.png)

_Figure 21: Activity Diagram for Request Return (Supplier)_


59


#### 3.5.9 Activity Diagram for Request Return (Customer)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-73-0.png)

_Figure 22: Activity Diagram for Request Return (Customer)_


60


#### 3.5.10 Activity Diagram for Receive the Order (Customer)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-74-0.png)

_Figure 23: Activity Diagram for Receive the Order (Customer)_


61


#### 3.5.11 Activity Diagram for Place the Order (Supplier)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-75-0.png)

_Figure 24: Activity Diagram for Place the Order (Supplier)_


62


#### 3.5.12 Activity Diagram for Track Order

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-76-0.png)

_Figure 25: Activity Diagram for Track Order_


63


#### 3.5.13 Activity Diagram for Add Compliments & Complaints

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-77-0.png)

_Figure 26: Activity Diagram for Add Compliments & Complaints_


64


#### 3.5.14 Activity Diagram for Prepare Invoice

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-78-0.png)

_Figure 27: Activity Diagram for Prepare Invoice_


65


### 3.6 Class Diagram for Proposed System

The class diagram below represents major entities in the system and their relationships, therefore
capturing the structure of core components of the system.

#### 3.6.1 Entity Class Diagram


This diagram represents the major data entities of the Customer, Supplier, Product, Order,
Inventory, with its attributes and their relationships. This provides the very basis of the data
structure in the system.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-79-0.png)


_Figure 28: Entity Class Diagram_


66


#### 3.6.2 Interface Class Diagram This interface class diagram depicts the interaction of the system interfaces with the user and other components. The interfaces involved in user login, order management, and report generation ensure that information flows smoothly.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-80-0.png)

_Figure 29: Interface Class Diagram_


67


#### 3.6.3 Controller Class Diagram

The controller class diagram indicates the control logic of the system, which takes care of user
interaction and couples them with backend processes. It shows how the system is processing user
requests, organizing data, handling order processing, updating inventory, and customer

management.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-81-0.png)


68


### 3.7 Sequence Diagrams for Proposed System

Sequence diagrams describe how various system elements interact in steps for specific processes,
such as an order being placed or inventory updates. They capture the sequence of messages
between users and the system and are hence indicative of process flow.

#### 3.7.1 Sequence Diagram for Register

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-82-0.png)


_Figure 31: Sequence Diagram for Register_


69


#### 3.7.2 Sequence Diagram for Login

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-83-0.png)

_Figure 32: Sequence Diagram for Login_



70


#### 3.7.3 Sequence Diagram for Update Profile

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-84-0.png)

_Figure 33: Sequence Diagram for Update Profile_


71


#### 3.7.4 Sequence Diagram for Manage Product Details

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-85-0.png)

_Figure 34: Sequence Diagram for Manage Product Details_


72


#### 3.7.5 Sequence Diagram for Manage Orders

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-86-0.png)

_Figure 35: Sequence Diagram for Manage Orders_


73


#### 3.7.6 Sequence Diagram for Manage Inventory

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-87-0.png)

_Figure 36: Sequence Diagram for Manage Inventory_


74


#### 3.7.7 Sequence Diagram for Request Returns (Supplier)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-88-0.png)

_Figure 37: Sequence Diagram for Request Returns (Supplier)_

#### 3.7.8 Sequence Diagram for Request Return (Customer)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-88-1.png)


_Figure 38: Sequence Diagram for Request Return (Customer)_


75


#### 3.7.9 Sequence Diagram for Receive the Order (Customer)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-89-0.png)

_Figure 39: Sequence Diagram for Receive the Order (Customer)_


76


#### 3.7.10 Sequence Diagram for Place the Order (Supplier)

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-90-0.png)

_Figure 40: Sequence Diagram for Place the Order (Supplier)_

#### 3.7.11 Sequence Diagram for Prepare Invoice

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-90-1.png)


_Figure 41: Sequence Diagram for Prepare Invoice_


77


#### 3.7.12 Sequence Diagram for Track Order

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-91-0.png)

_Figure 42: Sequence Diagram for Track Order_

#### 3.7.13 Sequence Diagram for Report Generation

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-91-1.png)


_Figure 43: Sequence Diagram for Report Generation_


78


#### 3.7.14 Sequence Diagram for Add Compliments & Complaints

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-92-0.png)

_Figure 44: Sequence Diagram for Add Compliments & Complaints_


79


### 3.8 ER Diagram for Proposed System

ER diagram graphically represents the structure of the database system, containing entities such
as Customer, Supplier, Product, and Order, among others, their respective relationships for data
to be in good order to support the operations of the system.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-93-0.png)


_Figure 45: ER Diagram_


80


### 3.9 Relational Data Model for Proposed System

It forms the basis of the relational data model, expanding the ER diagram to present tables,
fields, and keys for any given database.

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-94-0.png)


_Figure 46: Relational Data Model for Proposed System_


81


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-95-0.png)










|Name|Data Type|Constraints|Description|
|---|---|---|---|
|CustomerID|VARCHAR (50)|PRIMARY KEY<br>AUTO_INCREMENT|Unique identifier for<br>each customer|
|Name|VARCHAR (100)|NOT NULL|Customer’s name|
|Email|VARCHAR (255)|UNIQUE<br>NOT NULL|Customer’s email|
|ContactNo|VARCHAR (15)|NOT NULL|Customer’s contact<br>number|
|Address|VARCHAR (255)|NOT NULL|Customer’s address|


|CustomerID|Name|Email|ContactNo|Address|
|---|---|---|---|---|
|C001|Shop A|shopa@gamil.com|011 1234567|123, Sweet Rad,<br>Matara.|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-96-0.png)










|Name|Data Type|Constraints|Description|
|---|---|---|---|
|SupplierID|VARCHAR (50)|PRIMARY KEY<br>AUTO_INCREMENT|Unique identifier for<br>each supplier|
|Name|VARCHAR (100)|NOT NULL|Supplier’s name|
|Email|VARCHAR (255)|UNIQUE<br>NOT NULL|Supplier’s email|
|ContactNo|VARCHAR (15)|NOT NULL|Supplier’s contact<br>number|
|Address|VARCHAR (255)|NOT NULL|Supplier’s address|


|SupplierID|Name|Email|ContactNo|Address|
|---|---|---|---|---|
|S001|Ajantha Perera|ajantha@gamil.com|011 9876543|456, Market<br>Street, Matara|










|Name|Data Type|Constraints|Description|
|---|---|---|---|
|OrderID|VARCHAR (50)|PRIMARY KEY<br>AUTO INCREMENT|Unique identifier<br>for the order|
|CustomerID|VARCHAR (50)|FOREIGN KEY<br>REFERENCES Customer<br>(CustomerID)|Customer placing<br>the order|
|OrderDate|DATETIME|DEFAULT<br>CURRENT_TIMESTAMP|Date and time when<br>the order was<br>placed|
|ProductName|VARCHAR (100)|NOT NULL|Name of the<br>product in order|
|TotalAmount|DECIMAL (10,2)|NOT NULL|Total amount of the<br>order|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-97-0.png)






|OrderID|CustomerID|OrderDate|ProductName|TotalAmount|Status|
|---|---|---|---|---|---|
|CO001|C001|2021/11/14|Jelly Yogurt|5000.00|Delivered|














|Name|Data Type|Constraints|Description|
|---|---|---|---|
|SupplierOrderID|VARCHAR (50)|PRIMARY KEY<br>AUTO INCREMENT|Unique identifier<br>for the order|
|SupplierID|VARCHAR (50)|FOREIGN KEY<br>REFERENCES Supplier<br>(SupplierID)|Supplier placing<br>the order|
|OrderDate|DATETIME|DEFAULT<br>CURRENT_TIMESTAMP|Date and time<br>when the order was<br>placed|
|OrderItem|VARCHAR (100)|NOT NULL|Name of the<br>product in order|
|TotalAmount|DECIMAL (10,2)|NOT NULL|Total amount of the<br>order|
|Status|ENUM (Order<br>Received,<br>Preparing, Delivery<br>on the way,<br>Delivered)|DEFAULT|Order Status|




|SupplierOrderID|SupplierID|OrderDate|OrderItem|TotalAmount|Status|
|---|---|---|---|---|---|
|SO001|S001|2021/11/10|Fresh Milk|50,000.00|Delivered|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-98-0.png)


|Name|Data Type|Constraints|Description|
|---|---|---|---|
|ProductID|VARCHAR (50)|PRIMARY KEY<br>AUTO<br>INCREMENT|Unique identifier for<br>the product|
|Name|VARCHAR (100)|NOT NULL|Product’s name|
|Price|DECIMAL (10,2)|NOT NULL|Product’s price per<br>unit|
|Quantity|INT|NOT NULL|Description about the<br>product|


|ProductID|Name|Price|Quantity|
|---|---|---|---|
|P001|Jelly Yogurt|80.00|150|


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-99-0.png)


|Name|Data Type|Constraints|Description|
|---|---|---|---|
|OrderItemID|VARCHAR (50)|PRIMARY KEY<br>AUTO<br>INCREMENT|Unique identifier for<br>the order item|
|Name|VARCHAR (100)|NOT NULL|Order item’s name|
|Price|DECIMAL (10,2)|NOT NULL|Order item’s price per<br>unit|
|Quantity|INT|NOT NULL|Description about the<br>order item|


|OrderItemID|Name|Price|Quantity|
|---|---|---|---|
|I001|Fresh Milk|250.00|10L|


### 3.11 User Interfaces design for Proposed System

This section depicts the design of the main user interfaces of the system.


3.11.1 Home Screen

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-100-0.png)


_Figure 47: Home Screen UI_


87


3.11.2 Login Screen

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-101-0.png)


_Figure 48: Login Screen UI_


3.11.3 Login Screen

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-101-1.png)


_Figure 49: Login Screen UI_



88


3.11.4 Create Account

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-102-0.png)


_Figure 50: Create Account UI_


3.11.5 Forgot Password

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-102-1.png)


_Figure 51: Forgot Password UI_



89


3.11.6 Email Authentication

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-103-0.png)


_Figure 52: Email Authentication UI_


3.11.7 Manager Dashboard – User Management – Active Users

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-103-1.png)


_Figure 53: Manager Dashboard – User Management – Active Users UI_


90


3.11.8 Manager Dashboard – User Management – Pending Registration

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-104-0.png)


_Figure 54: Manager Dashboard – User Management – Pending Registration UI_


3.11.9 Manager Dashboard – Place the Order

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-104-1.png)


_Figure 55: Manager Dashboard – Place the Order UI_


91


3.11.10 Manager Dashboard – Order Management – Pending Customer Order

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-105-0.png)


_Figure 56: Manager Dashboard – Order Management – Pending Customer Order UI_


3.11.11 Manager Dashboard – Order Management – Approved Orders

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-105-1.png)


_Figure 57: Manager Dashboard – Order Management – Approved Orders UI_


92


3.11.12 Manager Dashboard – Order Management – Supplier Orders

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-106-0.png)


_Figure 58: Manager Dashboard – Order Management – Supplier Orders UI_


3.11.13 Manager Dashboard – Inventory Management – Current Inventory

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-106-1.png)


_Figure 59: Manager Dashboard – Inventory Management – Current Inventory UI_


93


3.11.14 Manager Dashboard – Inventory Management – Low Stock Items

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-107-0.png)


_Figure 60: Manager Dashboard – Inventory Management – Low Stock Items UI_


3.11.15 Manager Dashboard – Reports – Inventory Report

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-107-1.png)


_Figure 61: 3.10.15 Manager Dashboard – Reports – Inventory Report UI_


94


3.11.16 Manager Dashboard – Reports – Sales Report

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-108-0.png)


_Figure 62: Manager Dashboard – Reports – Sales Report UI_


3.11.17 Manager Dashboard – Reports – Customer Invoice

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-108-1.png)


_Figure 63: Manager Dashboard – Reports – Customer Invoice UI_


95


3.11.18 Manager Dashboard – Reports – Supplier Report

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-109-0.png)


_Figure 64: Manager Dashboard – Reports – Supplier Report UI_


3.11.19 Manager Dashboard – Return Request – Request from Customers

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-109-1.png)


_Figure 65: Manager Dashboard – Return Request – Request from Customers UI_


96


3.11.20 Manager Dashboard – Return Request – Request to Suppliers

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-110-0.png)


_Figure 66: Manager Dashboard – Return Request – Request to Suppliers UI_


3.11.21 Manager Dashboard – Communication Hub – Customer Feedback

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-110-1.png)


_Figure 67: Manager Dashboard – Communication Hub – Customer Feedback UI_


97


3.11.22 Manager Dashboard – Communication Hub – Supplier Feedback

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-111-0.png)


_Figure 68: Manager Dashboard – Communication Hub – Supplier Feedback UI_


3.11.23 Manager Dashboard – Edit Profile

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-111-1.png)


_Figure 69: Manager Dashboard – Edit Profile UI_


3.11.24 Supplier Dashboard – Order Management – New Order Request


98


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-112-0.png)

_Figure 70: Supplier Dashboard – Order Management – New Order Request UI_


3.11.25 Supplier Dashboard – Order Management – Confirmed Orders

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-112-1.png)


_Figure 71: Supplier Dashboard – Order Management – Confirmed Orders UI_


3.11.26 Supplier Dashboard – Inventory Supply – Current Supply List


99


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-113-0.png)

_Figure 72: Supplier Dashboard – Inventory Supply – Current Supply List UI_


3.11.27 Supplier Dashboard – Inventory Supply – Supply History

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-113-1.png)


_Figure 73: Supplier Dashboard – Inventory Supply – Supply History UI_


3.11.28 Supplier Dashboard – Return Request


100


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-114-0.png)

_Figure 74: Supplier Dashboard – Return Request UI_


3.11.29 Supplier Dashboard – Feedback

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-114-1.png)


_Figure 75: Supplier Dashboard – Feedback UI_


3.11.30 Supplier Dashboard – Edit Profile



101


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-115-0.png)

_Figure 76: Supplier Dashboard – Edit Profile UI_



102


3.11.31 Customer Dashboard – Place Order – View & Add Products

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-116-0.png)


_Figure 77: Customer Dashboard – Place Order – View & Add Products UI_


3.11.32 Customer Dashboard – Place Order – Order Summary

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-116-1.png)


_Figure 78: Customer Dashboard – Place Order – Order Summary UI_


3.11.33 Customer Dashboard – Order Tracking – Active Orders


103


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-117-0.png)

_Figure 79: Customer Dashboard – Order Tracking – Active Orders UI_


3.11.34 Customer Dashboard – Order Tracking – Order History

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-117-1.png)


_Figure 80: Customer Dashboard – Order Tracking – Order History UI_


3.11.35 Customer Dashboard – Return Request


104


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-118-0.png)

_Figure 81: Customer Dashboard – Return Request UI_


3.11.36 Customer Dashboard – Feedback

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-118-1.png)


_Figure 82: Customer Dashboard – Feedback UI_


3.11.37 Customer Dashboard – Edit Profile



105


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-119-0.png)

_Figure 83: Customer Dashboard – Edit Profile UI_

### 3.12 Summary


The following summary reviews key design elements discussed in this chapter. Each diagram
and model help to build a complete system design required to support the operation of a yogurt
factory and ensures that the system is functional, efficient, and friendly to users. The result of
such a design is bound to provide grounds for building a system that answers the needs of the
client.


106


# Chapter 4

**Outline of the Chapter**


4.1 Introduction


4.2 Programming Languages and Development Tools


4.2.1 React.js


4.2.2 Vite


4.2.3 Node.js


4.2.4 Tailwind CSS


4.2.5 MySQL


4.2.6 Figma


4.2.7 Visual Studio Code


4.2.8 GitHub


4.2.9 Postman


4.3 User Interface Demonstration and Data Entry Screens


4.4 Special Implementations


4.5 Quality Assurance Methods Used


4.6 Reports


4.7 Summary


107


### 4.1 Introduction

This chapter explains the different technologies and tools used to design, develop, and implement
the Yogurt Factory Management System. These tools were carefully chosen to meet the
requirements of the system, such as user-friendliness, performance, security, and ease of
maintenance.


The system has three main layers:


The frontend, which is what the users interact with (like placing orders or viewing inventory),


The backend, which processes data and connects the system together,


The database, which stores all important records such as customer information, product details,
orders, and reports.


This chapter also introduces the design tools and development environments that supported the
system development. Each tool used played a specific role in making the system efficient and
reliable. The following sections will explain the programming languages, libraries, frameworks,
and development environments used to build this solution.

### 4.2 Programming Languages and Development Tools


To build the web-based system successfully, a set of modern development tools and
programming technologies were used. These tools helped us manage different parts of the
system, from designing the interface to handling business logic and storing data securely.

#### 4.2.1 React.js


React.js is a popular JavaScript library used to build the frontend of the system. It helps in creating
dynamic, interactive, and responsive user interfaces. In this project, React was used to develop pages for
customer registration, placing orders, inventory views, and dashboards for managers and suppliers.


One of the biggest advantages of React is its component-based structure. Each part of the UI, such as a
form or a button, is built as a reusable component. This made the development process faster and more
organized.


108


#### 4.2.2 Vite

Vite is a build tool that works well with modern JavaScript frameworks like React. It helped to create a
fast and smooth development environment. Vite provides very quick startup times and real-time page
reloads whenever we made changes in the code.


Using Vite improved the developer experience and made the system easier to test during the development
phase.

#### 4.2.3 Node.js


Node.js is a server-side runtime environment that lets developers run JavaScript on the backend. It was
used to handle key processes such as user authentication, order processing, managing inventory data, and
generating reports.


Node.js is event-driven and non-blocking, which makes it ideal for systems that need to handle many user
actions at the same time, like a factory system with multiple customer and supplier activities.

#### 4.2.4 Tailwind CSS


Tailwind CSS is a utility-first CSS framework that was used to design the layout and appearance of the
user interface. Instead of writing custom CSS styles from scratch, Tailwind allowed us to apply styles
directly in the HTML code using predefined classes.


It helped to make the UI clean, modern, and responsive, meaning the system works well on different
screen sizes like desktop and mobile devices.

#### 4.2.5 MySQL


MySQL is a widely-used relational database system that was used to store all the data for the Yogurt
Factory Management System. It kept structured records for customers, suppliers, products, orders, and
inventory levels.


Using MySQL ensured that data was stored safely and could be retrieved efficiently. SQL queries helped
generate important reports, such as daily sales summaries or stock levels, which support decision-making.


109


#### 4.2.6 Figma

Figma is a cloud-based design tool used to create wireframes and visual prototypes of the system before
development started. It allowed us to design the user interface screens and get feedback from users and
the supervisor.


By using Figma, we were able to plan the layout and improve the user experience before writing any
code. This saved time and reduced mistakes in the final design.

#### 4.2.7 Visual Studio Code


Visual Studio Code (VS Code) is the main code editor used during the project. It supports multiple
programming languages, including JavaScript and SQL, and has many useful features like syntax
highlighting, extensions, and integrated terminal.


It helped developers write clean and organized code and test the application smoothly in one place.

#### 4.2.8 GitHub


GitHub was used for version control and collaboration. It allowed us to keep track of all changes made to
the project code and back it up securely online. Using GitHub made it easier to work as a team and
recover previous versions of the system if needed.

#### 4.2.9 Postman


Postman is a tool used for testing APIs. It helped verify that the backend (Node.js) correctly handled
requests sent from the frontend. For example, we used Postman to test user login, order submissions, and
inventory updates to make sure data was being processed and stored properly.


110


### 4.3 User Interface Demonstration and Data Entry Screens

User roles of yogurt factory management system include,


  - Manager

  - Customer

  - Supplier

#### 4.3.1 Home Page

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-124-0.png)


_Figure 84 - Home Page_

#### 4.3.2 About Us

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-124-1.png)


_Figure 85 - About Us_


111


#### 4.3.3 Featured Products

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-125-0.png)

_Figure 86 - Featured Products_

#### 4.3.4 Contact Us

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-125-1.png)


_Figure 87 - Contact Us_



112


#### 4.3.5 Footer

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-126-0.png)

_Figure 88 - Footer_

#### 4.3.6 Login Page

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-126-1.png)


_Figure 89 - Login Page_



113


#### 4.3.7 Create Account Page

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-127-0.png)

_Figure 90 - Create Account Page_

#### 4.3.8 Forgot Password

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-127-1.png)


_Figure 91 - Forgot Password_

#### 4.3.9 Password Reset Link

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-127-2.png)


_Figure 92 - Password Reset_



114


#### 4.3.10 Admin

_4.3.10.1 Admin Dashboard_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-128-0.png)


_Figure 93 - Admin Dashboard_


_4.3.10.2 User Management_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-128-1.png)


_Figure 94 - User Management_



115


_4.3.10.3 Request an Order_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-129-0.png)


_Figure 95 - Request an Order_


_4.3.10.4 Inventory Management_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-129-1.png)


_Figure 96 - Inventory Management_



116


_4.3.10.5 Inventory Low Stock_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-130-0.png)


_Figure 97 - Inventory Low Stock_


_4.3.10.6 Raw Material Management_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-130-1.png)


_Figure 98 - Raw Material Management_



117


_4.3.10.7 Pending Customer Order Management_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-131-0.png)


_Figure 99 - Pending Customer Order Management_


_4.3.10.8 Approved Customer Order Management_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-131-1.png)


_Figure 100 - Approved Customer Order Management_



118


_4.3.10.9 Supplier Order Management_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-132-0.png)


_Figure 101 - Supplier Order Management_


_4.3.10.10 Customer Order Refund_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-132-1.png)


_Figure 102 - Customer Order Refund_



119


_4.3.10.11 Return Request_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-133-0.png)


_Figure 103 - Return Request_


_4.3.10.12 Company Inventory_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-133-1.png)


_Figure 104 - Company Inventory_



120


_4.3.10.13 Company Inventory View Logs_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-134-0.png)


_Figure 105 - Company Inventory View Logs_

#### 4.3.11 Supplier


_4.3.11.1 Supplier Registration Form_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-134-1.png)


_Figure 106 - Supplier Registration Form_


121


_4.3.11.2 Supplier Details_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-135-0.png)


_Figure 107 - Supplier Details_


_4.3.11.3 Supplier Orders_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-135-1.png)


_Figure 108 - Supplier Orders_



122


_4.3.11.4 Supplier Return Request_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-136-0.png)


_Figure 109 - Supplier Return Request_

#### 4.3.12 Customer


_4.3.12.1 Product Page_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-136-1.png)


_Figure 110 - Product Page_



123


_4.3.12.2 Customer Profile_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-137-0.png)


_Figure 111 - Customer Profile I_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-137-1.png)


_Figure 112 - Customer Profile II_



124


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-138-0.png)

_Figure 113 - Customer Profile III_


_4.3.12.3 Cart_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-138-1.png)


_Figure 114 - Cart_



125


_4.3.12.4 Invoice_

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-139-0.png)


_Figure 115 - Customer Invoice_



126


### 4.4 Special Implementations

#### 4.4.1 Frontend Validation

**Preventing negative quantity inputs**

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-140-0.png)


_Figure 116 - Preventing negative quantity inputs_


**Validate required fields and expiry date before adding**

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-140-1.png)


_Figure 117 - Validate required fields and expiry date before adding_


127


#### 4.4.2 Backend Validation

**Check stock availability from backend before updating**

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-141-0.png)


_Figure 118 - Check stock availability from backend before updating_


128


#### 4.4.3 Error Handling

**Catching errors and showing toast**

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-142-0.png)


_Figure 119 - Catching errors and showing toast_



129


### 4.5 Quality Assurance Methods Used

To ensure the system is reliable, user-friendly, and free from critical bugs, the following QA techniques
were used during development


**1.** **Frontend Validation**


    - Input fields were validated.

    - Fields like quantity, email, password, and expiry date were checked before submission.

    - Prevented negative numbers, blank inputs, invalid formats.

**2.** **Backend Validation**


    - Used Node.js and Express to validate incoming API requests.

    - Ensured data integrity using:

`o` Data type checking (e.g., numbers, strings)
`o` Required fields (e.g., no empty product names or batch IDs)
`o` Business rules (e.g., expiry date not in the past, quantity must be ≥ 0)


**3.** **Error Handling**


    - Graceful error messages were shown using Toast notifications (success/error/info).

    - API errors (like failed DB operations or invalid inputs) were caught and displayed to the user.

    - Logging to console for developer-side debugging.

**4.** **Manual Testing**


    - System was manually tested on different pages like:

`o` Product management
`o` Order processing
`o` Inventory updates
`o` Login and registration

    - Edge cases like:

`o` Invalid input
`o` No stock available

`o` File size limits for image uploads (max 50MB)


**5.** **Browser Compatibility Testing**


    - Tested on modern browsers like Chrome and Firefox to ensure responsiveness and
performance.


130


### 4.6 Reports

#### 4.6.1 Inventory Report

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-144-0.png)

_Figure 120 - Inventory Report_



131


#### 4.6.2 Webstore Report

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-145-0.png)

_Figure 121 - Webstore Report_



132


#### 4.6.3 Customer Report

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-146-0.png)

_Figure 122 - Customer Report_



133


#### 4.6.4 Supplier Report

![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-147-0.png)

_Figure 123 - Supplier Report_



134


### 4.7 Summary

In this chapter, we described the major tools and technologies used to develop the Yogurt Factory
Management System. Each tool played a key role in making the system functional, fast, and easy to use.
React.js, Vite, and Tailwind CSS supported the frontend development, while Node.js and MySQL handled
the backend and data storage.


Design tools like Figma helped us plan the layout, and testing tools like Postman ensured that the system
was working correctly. Visual Studio Code and GitHub supported a smooth development workflow with
version control and collaboration.


The combination of these tools helped deliver a complete and user-friendly system that meets the
requirements of the yogurt factory’s daily operations.


135


# Chapter 5

**Outline of the Chapter**


5.1 Introduction


5.2 Degree of Objectives met


5.3 Usability, Accessibility, Reliability, and Friendliness


5.4 Limitations and Drawbacks


5.5 Future Modifications, Improvements, and Extensions Possible


5.6 Summary


136


### 5.1 Introduction

This chapter gives a final summary of the project. It reviews how well the system met the original
objectives, discusses the quality of the system in terms of usability and reliability, and identifies current
limitations. Finally, it suggests possible future improvements to make the system more effective and
useful for the yogurt factory.

### 5.2 Degree of Objectives met


The main goal of this project was to help the yogurt factory move from a manual system to a digital
platform. The system was designed to handle key operations such as customer and supplier registration,
order management, inventory control, report generation, and communication between all users.


  - All major objectives were successfully met:

  - Customers can register and place orders online.

  - The manager can track all orders, manage stock levels, and generate reports.

  - Suppliers can receive order requests and update delivery status.

  - The system allows feedback and return requests from both customers and suppliers.

  - Automatic low-stock alerts and role-based login features were also implemented.


Although some advanced features were not included due to time limitations, the system is functional and
meets the core business needs.

### 5.3 Usability, Accessibility, Reliability, and Friendliness


The system was developed with the end users in mind — the manager, customers, and suppliers.
Feedback from early users showed that the system is easy to use and understand.


**Usability:** The interface is simple, with clear navigation, forms, and buttons. Users do not need advanced
technical knowledge.


**Accessibility:** Since the system is web-based, it can be accessed from any device with a browser,
including desktop computers, tablets, and smartphones.


137


**Reliability:** During testing, the system performed reliably in handling actions like logging in, placing
orders, updating inventory, and generating reports.


**Friendliness:** The design uses friendly colors, icons, and messages to guide users. Error messages and
success alerts also help users know what’s happening in the system.

### 5.4 Limitations and Drawbacks


While the system is working well, there are still some limitations that need to be considered:


  - There is no mobile app, so users must use a browser to access the system.

  - Real-time notifications (like SMS or email) are not yet included.

  - It lacks advanced features such as sales analytics or automated suggestions for stock reordering.

  - The return/refund process is still semi-manual and may need more automation in the future.


These are not major issues, but they can affect the user experience as the business grows.

### 5.5 Future Modifications, Improvements, and Extensions Possible


To improve the system and keep it updated with future needs, the following improvements can be
considered:


  - Mobile App: Develop a mobile application for easier access by customers and suppliers.

  - Notifications: Add SMS or email notifications for order updates, confirmations, and stock alerts.

  - Data Analytics: Include charts, graphs, and insights to help the manager make decisions based on
sales trends and inventory data.

  - Stock Forecasting: Use machine learning to predict future stock needs based on order patterns.

  - Multi-language Support: Add options to use the system in Sinhala or Tamil, making it accessible

to more users.


138


### 5.6 Summary

This chapter reviewed the project outcome, showing that the Yogurt Factory Management System
achieved most of its goals and is ready for use in real-world operations. It is user-friendly, reliable, and
brings many improvements compared to the previous manual system. Although there are still areas to
improve, the system provides a strong foundation for future growth and digital transformation of the
business.


139


![](images/SDP-Sample-Report_40f7b8b3acc8edd08d33eb76bfa38a47.pdf-153-0.png)




141


