package main

import (
	"database/sql"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"strconv"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB
var productTemplate = "products.html"

type Product struct {
	ID          int
	Name        string
	Description string
	Price       float64
	ImageURL    string
}

func main() {
	// MySQL veritabanına bağlan
	var err error
	db, err = sql.Open("mysql", "root:admin@tcp(127.0.0.1:3306)/magaza")
	if err != nil {
		log.Fatal("Failed to connect to the database:", err)
	}
	defer db.Close()

	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/product/", productDetailHandler)
	http.Handle("/styles/", http.StripPrefix("/styles/", http.FileServer(http.Dir("styles"))))
	http.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir("images"))))
	http.HandleFunc("/cart", cartHandler)

	port := ":8080"
	log.Println("Server started on port", port)
	err = http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("Server error:", err)
	}
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	products, err := getProducts()
	if err != nil {
		http.Error(w, "Failed to get products", http.StatusInternalServerError)
		return
	}

	renderTemplate(w, "index.html", products)
}

func getProducts() ([]Product, error) {
	rows, err := db.Query("SELECT ID, Name, Description, Price, ImageURL FROM products")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.ImageURL)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}

	return products, nil
}

func productDetailHandler(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Path[len("/product/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	p, err := getProductByID(id)
	if err != nil {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	renderTemplate(w, productTemplate, p)
}

func getProductByID(id int) (Product, error) {
	var p Product
	err := db.QueryRow("SELECT ID, Name, Description, Price, ImageURL FROM products WHERE ID = ?", id).
		Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.ImageURL)
	if err != nil {
		return p, err
	}

	return p, nil
}

func renderTemplate(w http.ResponseWriter, tmplFile string, data interface{}) {
	tmpl, err := template.ParseFiles(tmplFile)
	if err != nil {
		http.Error(w, "Failed to render template", http.StatusInternalServerError)
		return
	}

	err = tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, "Failed to render template", http.StatusInternalServerError)
		return
	}
}

func cartHandler(w http.ResponseWriter, r *http.Request) {
	// Sepet bilgilerini localStorage'dan al
	cartItems := []Product{}
	cartItemsJSON := r.FormValue("cartItems")
	if cartItemsJSON != "" {
		if err := json.Unmarshal([]byte(cartItemsJSON), &cartItems); err != nil {
			log.Println("Failed to unmarshal cart items:", err)
		}
	}

	// Cart.html dosyasını parse et
	t, err := template.ParseFiles("cart.html")
	if err != nil {
		log.Println("Failed to parse cart.html template:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Sepet bilgilerini cart.html dosyasına gönder
	if err := t.Execute(w, cartItems); err != nil {
		log.Println("Failed to execute template:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}
