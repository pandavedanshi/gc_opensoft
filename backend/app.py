from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///./books.db' 
db = SQLAlchemy(app)

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    rating = db.Column(db.Float)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'genre': self.genre,
            'rating': self.rating
        }

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return """Welcome to the Book Library API! <br>
             Explore, add, and manage your literary collection. """

@app.route('/books', methods=['GET'])
def get_books():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    genre = request.args.get('genre')
    rating = request.args.get('rating')

    query = Book.query
    if genre:
        query = query.filter_by(genre=genre)
    if rating:
        query = query.filter(Book.rating >= float(rating))

    books = query.paginate(page=page, per_page=limit, error_out=False)
    return jsonify([book.to_dict() for book in books.items])

@app.route('/books', methods=['POST'])
def add_book():
    data = request.get_json()
    title = data.get('title')
    author = data.get('author')
    genre = data.get('genre')
    rating = data.get('rating')

    
    if not title or not author or not genre:
        return jsonify({'error': 'Title, author, and genre are required'}), 400

    book = Book(title=title, author=author, genre=genre, rating=rating)
    db.session.add(book)
    db.session.commit()
    return jsonify(book.to_dict()), 201

@app.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify(book.to_dict())

@app.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': f'Book {book_id} deleted successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)