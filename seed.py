from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

def seed():
    db = SessionLocal()
    existing = db.query(User).filter(User.email == 'admin@finance.com').first()
    if existing:
        print('Admin already exists')
        return

    admin = User(
        full_name='Super Admin',
        email='admin@finance.com',
        hashed_password=hash_password('Admin1234'),
        role=UserRole.admin,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    print('Admin user created successfully')
    print('Email: admin@finance.com')
    print('Password: Admin1234')

if __name__ == '__main__':
    seed()
