export default function NotFound() {
  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 text-center space-y-4">
        <div className="text-5xl">🔍</div>
        <h1 className="text-xl font-bold text-gray-900">Restaurant non trouvé</h1>
        <p className="text-gray-500 text-sm">
          Ce lien ne correspond à aucun établissement enregistré.
          <br />
          Vérifiez l&apos;URL et réessayez.
        </p>
      </div>
    </div>
  )
}
