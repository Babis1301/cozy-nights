<?php
/* ==========================================================================
   Cozy Nights & Serenity Stay — Επεξεργασία φόρμας επικοινωνίας
   Λαμβάνει POST από το contact.html, στέλνει email και επιστρέφει JSON.
   Λειτουργεί σε οποιοδήποτε PHP hosting (η συνάρτηση mail() πρέπει να είναι
   ενεργή — σχεδόν πάντα είναι σε shared hosting).
   ========================================================================== */

header('Content-Type: application/json; charset=utf-8');

/* --- Ρυθμίσεις (αλλάξτε εδώ αν χρειαστεί) ------------------------------- */
$RECIPIENT = 'vicky.tsakanika@gmail.com';     // πού φτάνουν τα μηνύματα
$SITE_NAME = 'Cozy Nights & Serenity Stay';

/* --- Μόνο POST --------------------------------------------------------- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Μη επιτρεπτή μέθοδος.']);
  exit;
}

/* --- Honeypot κατά spam: αν είναι συμπληρωμένο, είναι bot --------------- */
if (!empty($_POST['botcheck'])) {
  echo json_encode(['success' => true, 'message' => 'Ευχαριστούμε!']);
  exit;
}

/* --- Καθαρισμός (αφαίρεση header injection) ----------------------------- */
function clean($v) {
  return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', (string) $v));
}

$name    = clean($_POST['name']    ?? '');
$email   = clean($_POST['email']   ?? '');
$phone   = clean($_POST['phone']   ?? '');
$dates   = clean($_POST['dates']   ?? '');
$lodging = clean($_POST['lodging'] ?? '');
$message = trim($_POST['message']  ?? '');

/* --- Έλεγχος υποχρεωτικών πεδίων ---------------------------------------- */
$missing = [];
if ($name === '')                                    $missing[] = 'όνομα';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))      $missing[] = 'έγκυρο email';
if ($message === '')                                 $missing[] = 'μήνυμα';

if ($missing) {
  http_response_code(422);
  echo json_encode(['success' => false, 'message' => 'Παρακαλώ συμπληρώστε: ' . implode(', ', $missing) . '.']);
  exit;
}

/* --- Σύνθεση μηνύματος -------------------------------------------------- */
$subject = 'Νέο μήνυμα από το website — ' . $SITE_NAME;

$body  = "Νέο μήνυμα από τη φόρμα επικοινωνίας του site.\n\n";
$body .= "Όνομα:        $name\n";
$body .= "Email:        $email\n";
$body .= "Τηλέφωνο:     " . ($phone   !== '' ? $phone   : '—') . "\n";
$body .= "Ημερομηνίες:  " . ($dates   !== '' ? $dates   : '—') . "\n";
$body .= "Κατάλυμα:     " . ($lodging !== '' ? $lodging : '—') . "\n";
$body .= str_repeat('-', 40) . "\n";
$body .= "Μήνυμα:\n$message\n";

/* --- Επικεφαλίδες ------------------------------------------------------- */
$domain    = preg_replace('/^www\./', '', $_SERVER['SERVER_NAME'] ?? 'localhost');
$fromEmail = 'no-reply@' . $domain;

$headers  = 'From: =?UTF-8?B?' . base64_encode($SITE_NAME) . '?= <' . $fromEmail . ">\r\n";
$headers .= 'Reply-To: ' . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

/* --- Αποστολή ----------------------------------------------------------- */
$sent = @mail($RECIPIENT, $encodedSubject, $body, $headers, '-f' . $fromEmail);

if ($sent) {
  echo json_encode(['success' => true, 'message' => 'Ευχαριστούμε! Το μήνυμά σας στάλθηκε. Θα επικοινωνήσουμε σύντομα.']);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Δεν ήταν δυνατή η αποστολή αυτή τη στιγμή. Δοκιμάστε ξανά ή καλέστε μας στο +30 694 540 7693.']);
}
