package com.example.milk_agency_backend.service;

import com.example.milk_agency_backend.dto.OrderItemRequest;
import com.example.milk_agency_backend.dto.OrderRequest;
import com.example.milk_agency_backend.entity.Customer;
import com.example.milk_agency_backend.entity.Order;
import com.example.milk_agency_backend.entity.OrderItem;
import com.example.milk_agency_backend.entity.Price;
import com.example.milk_agency_backend.entity.Product;
import com.example.milk_agency_backend.entity.Stock;
import com.example.milk_agency_backend.entity.StockItem;
import com.example.milk_agency_backend.repository.CustomerRepository;
import com.example.milk_agency_backend.repository.OrderRepository;
import com.example.milk_agency_backend.repository.PriceRepository;
import com.example.milk_agency_backend.repository.ProductRepository;
import com.example.milk_agency_backend.repository.StockRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PriceRepository priceRepository;
    private final StockRepository stockRepository;

    public OrderService(
        OrderRepository orderRepository,
        CustomerRepository customerRepository,
        ProductRepository productRepository,
        PriceRepository priceRepository,
        StockRepository stockRepository
    ) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.priceRepository = priceRepository;
        this.stockRepository = stockRepository;
    }

    @Transactional
    public Order createOrder(OrderRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.customerId()));

        Long customerTypeId = customer.getCustomerType().getId();

        Stock stock = stockRepository.findByDate(request.date())
            .orElseThrow(() -> new RuntimeException("Stock not found for date: " + request.date()));

        Order order = new Order();
        order.setCustomer(customer);
        order.setDate(request.date());

        BigDecimal totalAmount = applyOrderItems(order, request.items(), customerTypeId, stock);
        order.setTotalAmount(totalAmount);

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    @Transactional
    public Order updateOrder(Long id, OrderRequest request) {
        Order existingOrder = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        Customer customer = customerRepository.findById(request.customerId())
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.customerId()));

        Long customerTypeId = customer.getCustomerType().getId();

        Stock previousStock = stockRepository.findByDate(existingOrder.getDate())
            .orElseThrow(() -> new RuntimeException("Stock not found for date: " + existingOrder.getDate()));

        restoreStock(existingOrder, previousStock);

        existingOrder.getOrderItems().clear();

        Stock targetStock = stockRepository.findByDate(request.date())
            .orElseThrow(() -> new RuntimeException("Stock not found for date: " + request.date()));

        existingOrder.setCustomer(customer);
        existingOrder.setDate(request.date());

        BigDecimal totalAmount = applyOrderItems(existingOrder, request.items(), customerTypeId, targetStock);
        existingOrder.setTotalAmount(totalAmount);

        return orderRepository.save(existingOrder);
    }

    private BigDecimal applyOrderItems(Order order, List<OrderItemRequest> itemRequests, Long customerTypeId, Stock stock) {
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : itemRequests) {
            Product product = productRepository.findById(itemRequest.productId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemRequest.productId()));

            Price priceEntity = priceRepository.findByProductIdAndCustomerTypeId(itemRequest.productId(), customerTypeId)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Price not found for productId " + itemRequest.productId() + " and customerTypeId " + customerTypeId
                    )
                );

            StockItem stockItem = findStockItem(stock, itemRequest.productId());

            if (stockItem.getQuantity() < itemRequest.quantity()) {
                throw new RuntimeException(
                    "Insufficient stock for productId " + itemRequest.productId() + ". Available: " + stockItem.getQuantity()
                );
            }

            stockItem.setQuantity(stockItem.getQuantity() - itemRequest.quantity());

            BigDecimal itemTotal = priceEntity.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.quantity());
            orderItem.setPrice(priceEntity.getPrice());
            orderItem.setTotal(itemTotal);

            order.getOrderItems().add(orderItem);
            totalAmount = totalAmount.add(itemTotal);
        }

        return totalAmount;
    }

    private void restoreStock(Order order, Stock stock) {
        for (OrderItem orderItem : order.getOrderItems()) {
            Long productId = orderItem.getProduct().getId();
            StockItem stockItem = findStockItem(stock, productId);
            stockItem.setQuantity(stockItem.getQuantity() + orderItem.getQuantity());
        }
    }

    private StockItem findStockItem(Stock stock, Long productId) {
        return stock.getStockItems().stream()
            .filter(item -> item.getProduct().getId().equals(productId))
            .findFirst()
            .orElseThrow(
                () -> new RuntimeException(
                    "Stock item not found for productId " + productId + " on date " + stock.getDate()
                )
            );
    }
}
