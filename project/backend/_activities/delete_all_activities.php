<?php
// backend/_activities/delete_all_activities.php

// TINAWANAN at tinanggal na natin ang CORS headers at db require dito
// dahil awtomatikong pinapagana na ito ng iyong api.php (Router) sa pinakataas.

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        // Direkta nating gagamitin ang $pdo variable na galing sa api.php / db.php
        $query = "DELETE FROM activities";
        $stmt = $pdo->prepare($query);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'All activities have been cleared successfully.'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to clear the activities table.'
            ]);
        }
    } catch (PDOException $e) {
        // Kapag may problema sa SQL query
        echo json_encode([
            'success' => false,
            'message' => 'Database Error: ' . $e->getMessage()
        ]);
    }
} else {
    // Kapag hindi DELETE request ang dumating
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method. DELETE required.'
    ]);
}
?>